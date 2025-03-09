
import { useState } from 'react';
import { generateAnswerExplanation } from '@/services/quiz/explanationService';
import { QuizQuestion } from '@/hooks/quiz/quizTypes';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useExplanationGeneration() {
  const { user } = useAuth();
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const trackExplanationGeneration = async (questionId: string, isCorrect: boolean) => {
    if (!user) return;
    
    try {
      await supabase.from('user_feature_interactions').insert({
        user_id: user.id,
        feature: 'explanation-generation',
        action: isCorrect ? 'correct-answer' : 'incorrect-answer',
        metadata: { question_id: questionId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking explanation generation:', error);
    }
  };

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
      // Track the explanation generation
      await trackExplanationGeneration(question.id, isCorrect);
      
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
