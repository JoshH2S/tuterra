
import { useState } from "react";

export type GenerationStage = 'preparing' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error';

export interface GenerationProgress {
  stage: GenerationStage;
  percentComplete: number;
  message: string;
}

export const useGenerationProgress = () => {
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'preparing',
    percentComplete: 0,
    message: 'Preparing to generate quiz...'
  });

  const updateGenerationProgress = (stage: GenerationStage, percentComplete: number, message: string) => {
    setGenerationProgress({
      stage,
      percentComplete,
      message
    });
  };

  const resetProgress = () => {
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 0,
      message: 'Ready to generate quiz...'
    });
  };

  return {
    generationProgress,
    updateGenerationProgress,
    resetProgress
  };
};
