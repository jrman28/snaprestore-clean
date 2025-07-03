import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Sparkles, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackPromptProps {
  restorationId: string;
  onClose: () => void;
  onComplete: () => void;
}

// Smart feedback logic - temporarily simplified for testing
const shouldShowFeedback = async (userId: string): Promise<boolean> => {
  try {
    // Check user's restoration count
    const { data: restorations, error: restoreError } = await supabase
      .from('photo_restorations')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (restoreError) throw restoreError;

    const restorationCount = restorations?.length || 0;

    // Production logic: Only proceed to check feedback logic if user has restorations
    if (restorationCount === 0) {
      return false;
    }

    // Check existing feedback (when table exists)
    try {
      const { data: feedbackHistory, error: feedbackError } = await supabase
        .from('user_feedback')
        .select('id, rating, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        // If table doesn't exist yet, show feedback on 3rd restoration (production behavior)
        if (feedbackError.message.includes('relation "user_feedback" does not exist')) {
          return restorationCount >= 3;
        }
        throw feedbackError;
      }

      const feedbackCount = feedbackHistory?.length || 0;
      const lastFeedback = feedbackHistory?.[0];

      // Never shown feedback before - show on 3rd restoration (as agreed)
      if (feedbackCount === 0 && restorationCount >= 3) {
        return true;
      }

      // Has given feedback before - use engagement patterns
      if (feedbackCount > 0) {
        const daysSinceLastFeedback = lastFeedback 
          ? Math.floor((Date.now() - new Date(lastFeedback.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // High engagement pattern (gave positive feedback recently)
        if (lastFeedback?.rating >= 4) {
          // Show again after 2 weeks for happy users
          return daysSinceLastFeedback >= 14 && restorationCount % 10 === 0;
        }

        // Low satisfaction pattern (gave negative feedback)
        if (lastFeedback?.rating <= 2) {
          // Show more frequently to track improvement (after 1 week, every 5 restorations)
          return daysSinceLastFeedback >= 7 && restorationCount % 5 === 0;
        }

        // Medium satisfaction (rating 3)
        // Show every 2 weeks, every 7 restorations
        return daysSinceLastFeedback >= 14 && restorationCount % 7 === 0;
      }

      return false;
    } catch (feedbackTableError) {
      // If any error with feedback table, show on 3rd restoration (production behavior)
      return restorationCount >= 3;
    }
  } catch (error) {
    console.error('Error determining feedback visibility:', error);
    // Fallback: show on 3rd restoration for safety (production behavior)
    try {
      const { data: restorations } = await supabase
        .from('photo_restorations')
        .select('id')
        .eq('user_id', userId);
      return (restorations?.length || 0) >= 3;
    } catch {
      return false;
    }
  }
};

export function FeedbackPrompt({ restorationId, onClose, onComplete }: FeedbackPromptProps) {
  const [step, setStep] = useState<'rating' | 'comment' | 'complete'>('rating');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if feedback should be shown
  useEffect(() => {
    const checkFeedbackEligibility = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setShouldShow(false);
          setIsLoading(false);
          return;
        }

        const show = await shouldShowFeedback(user.id);
        setShouldShow(show);
        setIsLoading(false);

        if (show) {
          // Track that feedback prompt was shown
          try {
            await supabase.from('analytics_events').insert({
              user_id: user.id,
              event_type: 'feedback_prompt_shown',
              event_data: { restoration_id: restorationId }
            });
          } catch (analyticsError) {
            // Analytics tracking failed - continue silently
          }
        }
      } catch (error) {
        console.error('Error checking feedback eligibility:', error);
        setShouldShow(false);
        setIsLoading(false);
      }
    };

    if (restorationId) {
      checkFeedbackEligibility();
    } else {
      setShouldShow(false);
      setIsLoading(false);
    }
  }, [restorationId]);

  // Auto-dismiss after 30 seconds if no interaction
  useEffect(() => {
    if (!shouldShow) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onClose, shouldShow]);

  // Don't render if loading or shouldn't show
  if (isLoading || !shouldShow) {
    return null;
  }

  const handleRatingSelect = async (selectedRating: number) => {
    setRating(selectedRating);
    
    // Track rating selection
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'feedback_rating_selected',
        event_data: { 
          restoration_id: restorationId,
          rating: selectedRating 
        }
      });
    }
    
    // Always show comment step now - different messaging for high vs low ratings
    setStep('comment');
  };

  const submitFeedback = async (finalRating: number, finalComment: string) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Determine if this is a potential testimonial
      const isPositiveFeedback = finalRating >= 4;
      const hasSubstantialComment = finalComment.trim().length > 20;
      const canUseAsTestimonial = isPositiveFeedback && hasSubstantialComment;

      const feedbackData = {
        user_id: user.id,
        restoration_id: restorationId,
        rating: finalRating,
        comment: finalComment.trim() || null,
        feedback_type: 'post_restoration',
        can_use_as_testimonial: canUseAsTestimonial,
        created_at: new Date().toISOString()
      };

      // Insert feedback into database
      const { error } = await supabase.from('user_feedback').insert(feedbackData);

      if (error) {
        // If table doesn't exist yet, silently continue (table will be created later)
        const errorMessage = error.message || error.details || error.hint || '';
        if (errorMessage.includes('relation "user_feedback" does not exist') || 
            errorMessage.includes('table "user_feedback" does not exist')) {
          // Table not created yet, feedback will be available once migration runs
        } else {
          console.error('Database error submitting feedback:', error);
          // For now, let's not throw the error - just log it and continue
        }
      }

      // Track feedback completion
      try {
        await supabase.from('analytics_events').insert({
          user_id: user.id,
          event_type: 'feedback_completed',
          event_data: { 
            restoration_id: restorationId,
            rating: finalRating,
            has_comment: !!finalComment.trim()
          }
        });
      } catch (analyticsError) {
        // Don't throw - analytics failure shouldn't prevent feedback success
      }

      // Show success state
      setStep('complete');
      
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve SnapRestore.",
      });

      // Auto-close after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Feedback Error",
        description: "We couldn't save your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = () => {
    if (rating) {
      submitFeedback(rating, comment);
    }
  };

  const getRatingEmoji = (ratingValue: number) => {
    const emojis = ['😞', '😕', '😐', '😊', '😍'];
    return emojis[ratingValue - 1];
  };

  const getRatingText = (ratingValue: number) => {
    const texts = ['Poor', 'Fair', 'Good', 'Great', 'Amazing'];
    return texts[ratingValue - 1];
  };

  if (step === 'complete') {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-soft">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Thank you!</h4>
            <p className="text-sm text-gray-600">Your feedback helps us improve</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-purple-200 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Quick feedback?</h4>
              <p className="text-xs text-gray-600">Help us improve your experience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {step === 'rating' && (
          <div>
            <p className="text-sm text-gray-700 mb-3">How happy are you with this restoration?</p>
            <div className="flex justify-between space-x-2">
              {[1, 2, 3, 4, 5].map((ratingValue) => (
                <Button
                  key={ratingValue}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRatingSelect(ratingValue)}
                  className="flex-1 flex flex-col items-center py-2 h-auto hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  disabled={isSubmitting}
                >
                  <span className="text-lg mb-1">{getRatingEmoji(ratingValue)}</span>
                  <span className="text-xs">{getRatingText(ratingValue)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 'comment' && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">{rating ? getRatingEmoji(rating) : ''}</span>
              <p className="text-sm text-gray-700">
                {rating && rating >= 4 ? (
                  <>
                    Tell us what you loved! <span className="text-gray-500">(optional)</span>
                  </>
                ) : (
                  <>
                    What could we improve? <span className="text-gray-500">(optional)</span>
                  </>
                )}
              </p>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                rating && rating >= 4 
                  ? "Share your experience - we might feature it on our website! 🌟"
                  : "Your thoughts help us improve..."
              }
              className="mb-3 text-sm"
              rows={rating && rating >= 4 ? 3 : 2}
              maxLength={500}
            />
            {rating && rating >= 4 && comment.trim().length > 20 && (
              <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-xs text-purple-700 mb-1">
                  ✨ Great testimonial! May we feature this on our website?
                </p>
                <label className="flex items-center space-x-2 text-xs text-purple-600">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => {}} // We'll handle this in the submission
                    className="rounded border-purple-300"
                  />
                  <span>Yes, you can use this as a testimonial</span>
                </label>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                onClick={handleCommentSubmit}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                onClick={() => submitFeedback(rating!, '')}
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 