import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import AuthModal from '@/components/AuthModal';
import FeatureList from '@/components/FeatureList';
import FeatureCards from '@/components/FeatureCards';
import SocialProof from '@/components/SocialProof';
import PricingSection from '@/components/PricingSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { TutorialTooltip } from '@/components/TutorialTooltip';
import { tutorialSteps } from '@/config/tutorialSteps';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // User just signed in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGetStartedClick = () => {
    setIsModalOpen(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#faf7ff',
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.15) 1px, transparent 0),
          radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.1) 1px, transparent 0)
        `,
        backgroundSize: '24px 24px, 48px 48px',
        backgroundPosition: '0 0, 12px 12px'
      }}
    >
      <Header onGetStartedClick={handleGetStartedClick} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Hero Content */}
          <div className="space-y-8 fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                ✨ Trusted by 50,000+ families worldwide
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Restore the Heart of Your Family Photos
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Give any photo—from faded black & white to timeworn snapshots—a fresh, modern look with our elegant restoration magic. Rediscover the beauty in every memory, no matter its age or condition.
              </p>
            </div>
            
            <FeatureList />
            
            <div className="pt-4 space-y-4">
              <button
                id="restore-button"
                onClick={handleGetStartedClick}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl touch-target"
              >
                Start Restoring Photos Free
              </button>
              
              <div className="text-sm text-gray-500">
                No credit card required • 1 free restoration to start
              </div>
            </div>
          </div>
          
          {/* Right Column - Before/After Demo */}
          <div className="space-y-6 fade-in">
            <div id="restore-slider">
              <BeforeAfterSlider />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-gray-600 font-medium">
                ✨ Powered by restoration magic
              </p>
              <p className="text-sm text-gray-500">
                See the transformation in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Pricing Section */}
      <PricingSection onSignUpClick={handleGetStartedClick} />

      {/* CTA Section */}
      <CTASection onSignUpClick={handleGetStartedClick} />
      
      {/* Footer */}
      <Footer />
      
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Index;
