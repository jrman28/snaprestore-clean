import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { PhotoUpload } from '@/components/PhotoUpload';
import { RestoreButton } from '@/components/RestoreButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RestoreSlider } from '@/components/RestoreSlider';
import { SuccessResult } from '@/components/SuccessResult';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, HelpCircle } from 'lucide-react';
import { TutorialTooltip } from '@/components/TutorialTooltip';
import { tutorialSteps } from '@/config/tutorialSteps';
import { TutorialProvider, useTutorialContext } from '@/contexts/TutorialContext';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://zrhektgjhalqlvaoystm.supabase.co";
const TEST_MODE = false; // Set to false for production
import { useToast } from '@/hooks/use-toast';

type RestoreState = 'upload' | 'ready' | 'loading' | 'complete' | 'error';

// PhotoUploadSection
const PhotoUploadSection = ({ selectedFile, imagePreview, onImageSelect }: any) => (
  <div id="photo-upload-area">
    <PhotoUpload 
      onImageSelect={onImageSelect}
      selectedFile={selectedFile}
      imagePreview={imagePreview}
    />
  </div>
);

// RestoreSection
const RestoreSection = ({ onRestore }: any) => (
  <div className="mb-6">
    <div id="restore-button">
      <RestoreButton onRestore={onRestore} />
    </div>
  </div>
);

// ResultSection
const ResultSection = ({ imagePreview, restoredImage, onDownload, onShare, onStartOver, restoration }: any) => (
  <div className="space-y-6 mb-6">
    <div id="comparison-slider">
      <RestoreSlider 
        originalImage={imagePreview}
        restoredImage={restoredImage}
      />
    </div>
    <div id="share-button">
      <SuccessResult 
        restoredImage={restoredImage}
        onDownload={onDownload}
        onShare={onShare}
        restoration={restoration}
      />
    </div>
    <div className="text-center">
      <Button
        onClick={onStartOver}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <RotateCcw className="mr-2" size={16} />
        <Sparkles className="mr-2" size={16} />
        Restore Another Photo
      </Button>
    </div>
  </div>
);

const DashboardContent = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [restoreState, setRestoreState] = useState<RestoreState>('upload');
  const [restorationId, setRestorationId] = useState<string | null>(null);
  const [restorationData, setRestorationData] = useState<any>(null);
  const { showTutorial, startTutorial, completeTutorial } = useTutorialContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Helper function to get user settings
  const getUserSettings = () => {
    try {
      const savedSettings = localStorage.getItem('snaprestore-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { autoDownload: true, fileFormat: 'jpg' }; // defaults
  };

  // Restore state from localStorage on component mount
  useEffect(() => {
    const checkAndRestoreState = async () => {
      const savedState = localStorage.getItem('snaprestore-dashboard-state');
      if (savedState) {
        try {
          const { restoreState: savedRestoreState, restorationId: savedRestorationId, imagePreview: savedImagePreview, restorationData: savedRestorationData } = JSON.parse(savedState);
          
          if (savedRestoreState === 'loading' && savedRestorationId) {
            // Check if the restoration actually exists and its current status
            const { data: restoration, error } = await supabase
              .from('photo_restorations')
              .select('*')
              .eq('replicate_job_id', savedRestorationId)
              .single();

            if (error || !restoration) {
              // Restoration doesn't exist, clear saved state
              console.log('Clearing invalid restoration state - restoration not found');
              localStorage.removeItem('snaprestore-dashboard-state');
              return;
            }

            // Check restoration status
            if (restoration.status === 'completed' && restoration.restored_image_url) {
              // Restoration completed while we were away, show result
              setRestoreState('complete');
              setImagePreview(savedImagePreview);
              setRestoredImage(restoration.restored_image_url);
              setRestorationData({
                id: restoration.id,
                originalName: restoration.original_filename,
                restoredImageUrl: restoration.restored_image_url
              });
              saveDashboardState('complete', null, savedImagePreview, {
                id: restoration.id,
                originalName: restoration.original_filename,
                restoredImageUrl: restoration.restored_image_url
              });
            } else if (restoration.status === 'failed') {
              // Restoration failed, clear state and show upload
              console.log('Clearing failed restoration state');
              localStorage.removeItem('snaprestore-dashboard-state');
              toast({
                title: "Previous Restoration Failed",
                description: "Your previous restoration encountered an error. Please try again.",
                variant: "destructive"
              });
            } else if (restoration.status === 'processing') {
              // Check if restoration is too old (over 5 minutes)
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              const restorationTime = new Date(restoration.created_at);
              
              if (restorationTime < fiveMinutesAgo) {
                // Restoration is stuck, clear state
                console.log('Clearing stuck restoration state - too old');
                localStorage.removeItem('snaprestore-dashboard-state');
                toast({
                  title: "Previous Restoration Expired",
                  description: "Your previous restoration took too long and has been cancelled.",
                  variant: "destructive"
                });
              } else {
                // Resume polling for active restoration
                setRestoreState('loading');
                setRestorationId(savedRestorationId);
                setImagePreview(savedImagePreview);
                pollForCompletion(savedRestorationId);
              }
            }
          } else if (savedRestoreState === 'complete' && savedRestorationData) {
            // Restore completed state
            setRestoreState('complete');
            setImagePreview(savedImagePreview);
            setRestoredImage(savedRestorationData.restoredImageUrl);
            setRestorationData(savedRestorationData);
            
            // Show notification about My Restorations page
            setTimeout(() => {
              toast({
                title: "Restoration Restored",
                description: "Your previous restoration is shown below. All completed restorations are saved in 'My Restorations' page.",
                duration: 6000, // Show for 6 seconds
              });
            }, 1000); // Small delay to avoid showing immediately
          }
        } catch (error) {
          console.error('Error restoring dashboard state:', error);
          localStorage.removeItem('snaprestore-dashboard-state');
        }
      }
    };

    checkAndRestoreState();
  }, []);

  // Function to clean up stuck restorations
  const saveDashboardState = (state: RestoreState, id: string | null, preview: string | null, data: any = null) => {
    if (state === 'loading' && id) {
      localStorage.setItem('snaprestore-dashboard-state', JSON.stringify({
        restoreState: state,
        restorationId: id,
        imagePreview: preview
      }));
    } else if (state === 'complete' && data) {
      localStorage.setItem('snaprestore-dashboard-state', JSON.stringify({
        restoreState: state,
        imagePreview: preview,
        restorationData: data
      }));
    } else {
      localStorage.removeItem('snaprestore-dashboard-state');
    }
  };

  // Wait for isMobile to be determined
  if (typeof isMobile === 'undefined') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  const handleImageSelect = (file: File, imageUrl: string) => {
    setSelectedFile(file);
    setImagePreview(imageUrl);
    setRestoreState(file ? 'ready' : 'upload');
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('restorations')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('restorations')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }

    setRestoreState('loading');

    try {
      // Upload image to Supabase storage
      const imageUrl = await uploadImageToSupabase(selectedFile);
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Get user session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the restore-image edge function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/restore-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          imageUrl,
          original_filename: selectedFile.name,
          testMode: TEST_MODE
        })
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        try {
          const result = await response.json();
          console.error('API Error Response:', result);
          console.error('Full error details:', JSON.stringify(result, null, 2));
          if (response.status === 402) {
            throw new Error('Insufficient credits. Please purchase more credits to continue.');
          }
          
          // Show more specific Replicate error details if available
          if (result.replicateDetail) {
            errorMessage = `Replicate API Error: ${result.replicateDetail}`;
          } else if (result.details && typeof result.details === 'object') {
            errorMessage = result.error || `API Error: ${JSON.stringify(result.details)}`;
          } else {
            errorMessage = result.error || result.details || errorMessage;
          }
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          const responseText = await response.text();
          console.error('Raw error response:', responseText);
          errorMessage = `${errorMessage}: Unable to parse response`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Start polling for completion
      setRestorationId(result.prediction_id);
      saveDashboardState('loading', result.prediction_id, imagePreview, null);
      
      if (TEST_MODE) {
        // In test mode, add a 7-second delay before polling to simulate processing
        setTimeout(() => {
          pollForCompletion(result.prediction_id);
        }, 7000);
      } else {
        pollForCompletion(result.prediction_id);
      }

      toast({
        title: TEST_MODE ? "🧪 Test Restoration Started" : "Restoration Started",
        description: TEST_MODE 
          ? "Test mode: Your photo will be 'restored' with a sample image in 7 seconds (no API charges)."
          : "Your photo is being restored. This usually takes 30-60 seconds."
      });

    } catch (error: any) {
      console.error('Restoration error:', error);
      setRestoreState('error');
      toast({
        title: "Restoration Failed",
        description: error.message || "An error occurred during restoration",
        variant: "destructive"
      });
    }
  };

  const pollForCompletion = async (predictionId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const { data: restoration, error } = await supabase
          .from('photo_restorations')
          .select('*')
          .eq('replicate_job_id', predictionId)
          .single();

        if (error) {
          console.error('Error polling restoration:', error);
          return;
        }

        if (restoration?.status === 'completed' && restoration.restored_image_url) {
          setRestoredImage(restoration.restored_image_url);
          setRestoreState('complete');
          
          // Store restoration data for feedback system
          const restorationData = {
            id: restoration.id,
            originalName: restoration.original_filename,
            restoredImageUrl: restoration.restored_image_url
          };
          setRestorationData(restorationData);
          
          saveDashboardState('complete', null, imagePreview, restorationData); // Save completed state
          
          // Check if auto-download is enabled
          const settings = getUserSettings();
          if (settings.autoDownload) {
            // Trigger auto-download
            setTimeout(async () => {
              try {
                const response = await fetch(restoration.restored_image_url);
                if (!response.ok) throw new Error('Failed to fetch image');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `restored_${restoration.original_filename || 'image.jpg'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast({
                  title: "Auto-download started",
                  description: `Downloading restored ${restoration.original_filename}`,
                });
              } catch (error) {
                console.error('Auto-download failed:', error);
              }
            }, 1000); // Small delay to ensure UI updates first
          }
          
          toast({
            title: "Restoration Complete!",
            description: "Your photo has been successfully restored."
          });
          return;
        }

        if (restoration?.status === 'failed') {
          setRestoreState('error');
          saveDashboardState('error', null, null, null); // Clear saved state
          
          // Refund credit for failed restoration
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const { data: currentCredits } = await supabase
                .from('user_credits')
                .select('credits')
                .eq('user_id', session.user.id)
                .single();
              
              if (currentCredits) {
                await supabase
                  .from('user_credits')
                  .update({ credits: currentCredits.credits + 1 })
                  .eq('user_id', session.user.id);
              }
            }
          } catch (refundError) {
            console.error('Error refunding credit:', refundError);
          }
          
          toast({
            title: "Restoration Failed",
            description: "The AI restoration process failed. Your credit has been refunded.",
            variant: "destructive"
          });
          return;
        }

        // Continue polling if still processing
        attempts++;
        if (attempts < maxAttempts) {
          // In test mode, check more frequently since it should complete quickly
          const pollInterval = TEST_MODE ? 1000 : 5000; // 1 second for test mode, 5 seconds for production
          setTimeout(poll, pollInterval);
        } else {
          setRestoreState('error');
          saveDashboardState('error', null, null, null); // Clear saved state
          
          // Refund credit for timeout
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const { data: currentCredits } = await supabase
                .from('user_credits')
                .select('credits')
                .eq('user_id', session.user.id)
                .single();
              
              if (currentCredits) {
                await supabase
                  .from('user_credits')
                  .update({ credits: currentCredits.credits + 1 })
                  .eq('user_id', session.user.id);
              }
            }
          } catch (refundError) {
            console.error('Error refunding credit:', refundError);
          }
          
          toast({
            title: "Restoration Timeout",
            description: "The restoration is taking longer than expected. Your credit has been refunded.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          const pollInterval = TEST_MODE ? 1000 : 5000;
          setTimeout(poll, pollInterval);
        }
      }
    };

    poll();
  };

  const handleDownload = async () => {
    if (!restoredImage) return;
    
    try {
      // Fetch the image from the URL
      const response = await fetch(restoredImage);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      // Convert to blob
      const blob = await response.blob();
      
      // Create object URL
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `restored_${selectedFile?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success toast
      toast({
        title: "Download started",
        description: `Downloading restored ${selectedFile?.name || 'image'}`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the restored image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && restoredImage) {
      navigator.share({
        title: 'My Restored Photo',
        text: 'Check out my restored photo!',
        url: restoredImage,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setRestoredImage(null);
    setRestoreState('upload');
    setRestorationData(null);
    saveDashboardState('upload', null, null, null); // Clear saved state
  };

  const handleTutorialComplete = () => {
    completeTutorial();
  };

  const tutorialButton = (
    <Button
      onClick={startTutorial}
      variant="ghost"
      size="icon"
      className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3"
      title="Show Tutorial"
    >
      <HelpCircle className="h-6 w-6 text-gray-600" />
    </Button>
  );

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header variant="dashboard" />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div id="dashboard-content" className="max-w-4xl mx-auto">
              <div className="text-center mb-6 lg:mb-8">
                {TEST_MODE && (
                  <div className="mb-4 space-y-2">
                    <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                      🧪 TEST MODE ACTIVE - No API charges will be incurred
                    </div>
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Restore Your <span className="text-purple-600">Memories</span>
                </h1>
                <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                  Transform your old, damaged photos into stunning restored memories with 
                  our AI-powered restoration technology.
                </p>
              </div>
              {restoreState === 'upload' || restoreState === 'ready' ? (
                <>
                  <PhotoUploadSection 
                    selectedFile={selectedFile}
                    imagePreview={imagePreview}
                    onImageSelect={handleImageSelect}
                  />
                  {restoreState === 'ready' && (
                    <RestoreSection onRestore={handleRestore} />
                  )}
                </>
              ) : restoreState === 'loading' ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 shadow-lg">
                  <LoadingSpinner />
                </div>
              ) : restoreState === 'error' ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 shadow-lg">
                  <p className="text-red-500">
                    {restoredImage}
                  </p>
                  <Button
                    onClick={handleStartOver}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RotateCcw className="mr-2" size={16} />
                    <Sparkles className="mr-2" size={16} />
                    Try Again
                  </Button>
                </div>
              ) : (
                <ResultSection 
                  imagePreview={imagePreview!}
                  restoredImage={restoredImage!}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onStartOver={handleStartOver}
                  restoration={restorationData}
                />
              )}
            </div>
          </div>
          {showTutorial && (
            <TutorialTooltip
              steps={tutorialSteps}
              onComplete={handleTutorialComplete}
              show={showTutorial}
            />
          )}
          {tutorialButton}
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <Header variant="dashboard" />
          <div className="flex-1 p-8">
            <div id="dashboard-content" className="max-w-4xl mx-auto">
              <div className="text-center mb-6 lg:mb-8">
                {TEST_MODE && (
                  <div className="mb-4 space-y-2">
                    <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                      🧪 TEST MODE ACTIVE - No API charges will be incurred
                    </div>
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Restore Your <span className="text-purple-600">Memories</span>
                </h1>
                <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                  Transform your old, damaged photos into stunning restored memories with 
                  our AI-powered restoration technology.
                </p>
              </div>
              {restoreState === 'upload' || restoreState === 'ready' ? (
                <>
                  <PhotoUploadSection 
                    selectedFile={selectedFile}
                    imagePreview={imagePreview}
                    onImageSelect={handleImageSelect}
                  />
                  {restoreState === 'ready' && (
                    <RestoreSection onRestore={handleRestore} />
                  )}
                </>
              ) : restoreState === 'loading' ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-lg">
                  <LoadingSpinner />
                </div>
              ) : restoreState === 'error' ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 lg:p-12 shadow-lg">
                  <p className="text-red-500">
                    {restoredImage}
                  </p>
                  <Button
                    onClick={handleStartOver}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <RotateCcw className="mr-2" size={16} />
                    <Sparkles className="mr-2" size={16} />
                    Try Again
                  </Button>
                </div>
              ) : (
                <ResultSection 
                  imagePreview={imagePreview!}
                  restoredImage={restoredImage!}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onStartOver={handleStartOver}
                  restoration={restorationData}
                />
              )}
            </div>
          </div>
        </main>
        {showTutorial && (
          <TutorialTooltip
            steps={tutorialSteps}
            onComplete={handleTutorialComplete}
            show={showTutorial}
          />
        )}
        {tutorialButton}
      </div>
    </SidebarProvider>
  );
};

const Dashboard = () => (
  <TutorialProvider>
    <DashboardContent />
  </TutorialProvider>
);

export default Dashboard;
