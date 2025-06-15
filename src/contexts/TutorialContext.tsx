import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const TUTORIAL_STORAGE_KEY = 'snaprestore_tutorial_completed';

interface TutorialContextType {
  showTutorial: boolean;
  startTutorial: () => void;
  completeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Only check for first-time user on initial mount
    const hasCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
    setShowTutorial(!hasCompleted);
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, startTutorial, completeTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorialContext = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorialContext must be used within a TutorialProvider');
  }
  return context;
}; 