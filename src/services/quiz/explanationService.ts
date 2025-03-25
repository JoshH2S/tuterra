
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { explanationCache } from "./explanationCache";

export const generateAnswerExplanation = async (
  question: QuizQuestion,
  userAnswer: string,
  isCorrect: boolean
): Promise<string> => {
  const cacheKey = {
    questionId: question.id,
    userAnswer: userAnswer
  };

  // Check if we have a cached explanation
  const cachedExplanation = explanationCache.get(cacheKey);
  if (cachedExplanation) {
    console.log("Using cached explanation for:", question.id);
    return cachedExplanation;
  }

  try {
    // Get user's tier to determine explanation quality
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .maybeSingle();
    
    const userTier = userProfile?.subscription_tier || 'free';
    
    // Call edge function to generate explanation
    const { data, error } = await supabase.functions.invoke('generate-explanation', {
      body: {
        question: question.question,
        userAnswer: question.options[userAnswer] || userAnswer,
        correctAnswer: question.options[question.correct_answer] || question.correct_answer,
        isCorrect,
        topic: question.topic,
        tier: userTier // Pass tier to customize explanation quality
      }
    });

    if (error) throw error;
    
    const explanation = data.explanation;
    
    // Cache the explanation
    explanationCache.set(cacheKey, explanation);
    
    return explanation;
  } catch (error) {
    console.error('Error generating explanation:', error);
    
    // Fallback explanation if API fails - tier-based
    let fallback = isCorrect 
      ? `Correct! This answer demonstrates understanding of ${question.topic}.`
      : `This answer isn't quite right. The correct answer is "${question.options[question.correct_answer]}" which relates to key concepts in ${question.topic}.`;
    
    return fallback;
  }
};
