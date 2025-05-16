
import { useState } from "react";

type GenerationStage = 'preparing' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error';

interface GenerationProgress {
  stage: GenerationStage;
  percentComplete: number;
  message: string;
}

export const useQuizGenerationProgress = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'preparing',
    percentComplete: 0,
    message: 'Preparing to generate quiz...'
  });

  const updateProgress = (stage: GenerationStage, percentComplete: number, message: string) => {
    setGenerationProgress({
      stage,
      percentComplete,
      message,
    });
  };
  
  const setPreparingStage = () => {
    updateProgress('preparing', 10, 'Preparing to generate quiz...');
  };
  
  const setAnalyzingStage = () => {
    updateProgress('analyzing', 30, 'Analyzing your content...');
  };
  
  const setGeneratingStage = (percent: number = 50) => {
    updateProgress('generating', percent, 'Generating quiz questions...');
  };
  
  const setSavingStage = () => {
    updateProgress('saving', 90, 'Saving quiz to your account...');
  };
  
  const setCompleteStage = () => {
    updateProgress('complete', 100, 'Quiz saved successfully!');
  };
  
  const setErrorStage = (errorMessage: string) => {
    updateProgress('error', 0, errorMessage);
  };

  const resetProgress = () => {
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 0,
      message: 'Preparing to generate quiz...'
    });
    setError(null);
  };

  return {
    isProcessing,
    setIsProcessing,
    error,
    setError,
    generationProgress,
    setGenerationProgress,
    updateProgress,
    setPreparingStage,
    setAnalyzingStage,
    setGeneratingStage,
    setSavingStage,
    setCompleteStage,
    setErrorStage,
    resetProgress
  };
};
