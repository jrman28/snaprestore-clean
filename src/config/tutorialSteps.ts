import { TutorialStep } from '@/components/TutorialTooltip';

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SnapRestore',
    content: 'Let\'s walk through how to restore your photos in just a few simple steps.',
    position: 'center',
    target: 'center',
  },
  {
    id: 'upload',
    title: 'Upload Your Photo',
    content: 'Start by uploading the photo you want to restore. You can drag and drop or click to browse.',
    position: 'top',
    target: '#photo-upload-area',
  },
  {
    id: 'restore',
    title: 'Restore Your Photo',
    content: 'Click the restore button to start the AI-powered restoration process.',
    position: 'top',
    target: '#restore-button',
  },
  {
    id: 'compare',
    title: 'Compare Results',
    content: 'Use the slider to compare the before and after results of your restored photo.',
    position: 'top',
    target: '#comparison-slider',
  },
  {
    id: 'share',
    title: 'Share Your Results',
    content: 'Share your restored photo with friends and family using the share button.',
    position: 'top',
    target: '#share-button',
  },
]; 