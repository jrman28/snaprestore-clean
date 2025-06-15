import React, { useState } from 'react';
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

type RestoreState = 'upload' | 'ready' | 'loading' | 'complete';

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
const ResultSection = ({ imagePreview, restoredImage, onDownload, onShare, onStartOver }: any) => (
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
  const { showTutorial, startTutorial, completeTutorial } = useTutorialContext();
  const isMobile = useIsMobile();

  // Wait for isMobile to be determined
  if (typeof isMobile === 'undefined') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  const handleImageSelect = (file: File, imageUrl: string) => {
    setSelectedFile(file);
    setImagePreview(imageUrl);
    setRestoreState(file ? 'ready' : 'upload');
  };

  const handleRestore = async () => {
    setRestoreState('loading');
    setTimeout(() => {
      setRestoredImage(imagePreview);
      setRestoreState('complete');
    }, 3000);
  };

  const handleDownload = () => {
    if (restoredImage) {
      const link = document.createElement('a');
      link.href = restoredImage;
      link.download = `restored_${selectedFile?.name || 'image.jpg'}`;
      link.click();
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
              ) : (
                <ResultSection 
                  imagePreview={imagePreview!}
                    restoredImage={restoredImage!}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  onStartOver={handleStartOver}
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
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Restore Your <span className="text-purple-600">Memories</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              ) : (
                <ResultSection 
                  imagePreview={imagePreview!}
                    restoredImage={restoredImage!}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  onStartOver={handleStartOver}
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
