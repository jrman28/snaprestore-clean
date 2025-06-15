import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight } from 'lucide-react';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  target: string;
}

interface TutorialTooltipProps {
  steps: TutorialStep[];
  onComplete: () => void;
  show: boolean;
}

export function TutorialTooltip({ steps, onComplete, show }: TutorialTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (show) setCurrentStep(0);
  }, [show]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleComplete();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  }, [handleNext, handleComplete]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleComplete();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [show, handleComplete]);

  if (!show) return null;

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const currentStepNumber = currentStep + 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-content"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute inset-0 bg-black/50" 
        aria-hidden="true"
        onClick={handleComplete}
      />
      <Card 
        className="relative z-50 max-w-sm w-full p-4 bg-white shadow-lg rounded-lg"
        role="document"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 
            id="tutorial-title" 
            className="font-semibold text-lg"
          >
            {step.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComplete}
            className="h-8 w-8 p-0"
            aria-label="Close tutorial"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <p 
          id="tutorial-content" 
          className="text-gray-600 mb-4"
        >
          {step.content}
        </p>
        <div className="flex justify-between items-center">
          <div 
            className="flex space-x-1"
            role="tablist"
            aria-label="Tutorial progress"
          >
            {steps.map((_, index) => (
              <div
                key={index}
                role="tab"
                aria-selected={index === currentStep}
                aria-label={`Step ${index + 1} of ${totalSteps}`}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700"
            aria-label={currentStep < steps.length - 1 ? 'Next step' : 'Finish tutorial'}
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              'Finish'
            )}
          </Button>
        </div>
        <div className="sr-only" aria-live="polite">
          Step {currentStepNumber} of {totalSteps}: {step.title}
        </div>
      </Card>
    </div>
  );
} 