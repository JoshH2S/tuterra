
import { useState } from 'react';
import { generateAnswerExplanation } from '@/services/quiz/explanationService';
import { QuizQuestion } from '@/hooks/quiz/quizTypes';

export function useExplanationGeneration() {
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExplanation = async (
    question: QuizQuestion,
    userAnswer: string,
    isCorrect: boolean
  ) => {
    // If we already have an explanation for this question, don't generate again
    if (explanations[question.id]) {
      return;
    }

    setIsGenerating(true);

    try {
      const explanation = await generateAnswerExplanation(
        question,
        userAnswer,
        isCorrect
      );

      setExplanations(prev => ({
        ...prev,
        [question.id]: explanation
      }));
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    explanations,
    isGenerating,
    generateExplanation
  };
}
