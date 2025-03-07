
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "./quizTypes";

export const useQuizAnswers = (questions: QuizQuestion[]) => {
  // Initialize with empty object to ensure no pre-selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  // Generate an explanation for the answer
  const generateExplanation = useCallback(async (
    questionIndex: number, 
    question: QuizQuestion, 
    selectedAnswer: string
  ) => {
    if (!question) return;
    
    // If there's already an explanation from the database, use that
    if (question.explanation) {
      setExplanations(prev => ({ ...prev, [questionIndex]: question.explanation! }));
      return;
    }
    
    setIsGeneratingExplanation(true);
    try {
      const isCorrect = selectedAnswer === question.correct_answer;
      const selectedText = question.options[selectedAnswer];
      const correctText = question.options[question.correct_answer];
      
      const { data, error } = await supabase.functions.invoke('process-with-openai', {
        body: {
          prompt: `You are an educational assistant providing detailed feedback on quiz answers.
          
          The question was: "${question.question}"
          
          The available options were:
          ${Object.entries(question.options).map(([key, value]) => `${key}: ${value}`).join('\n')}
          
          The correct answer is: ${question.correct_answer} (${correctText})
          
          The student selected: ${selectedAnswer} (${selectedText})
          
          ${isCorrect ? 
            "The student answered correctly. Provide a detailed explanation (3-4 sentences) of why this answer is correct. Include relevant facts or concepts that support this answer. Use an encouraging, positive tone." : 
            "The student answered incorrectly. Provide a detailed explanation (3-4 sentences) of why their answer is wrong and why the correct answer is right. Explain the misconception they might have had. Be supportive and educational."
          }
          
          Your explanation should be educational and help the student understand the concept better.`,
          temperature: 0.7,
          max_tokens: 200
        }
      });
      
      if (error) throw error;
      
      if (data && data.response) {
        setExplanations(prev => ({ ...prev, [questionIndex]: data.response }));
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Still set the feedback even if explanation fails
      setExplanations(prev => ({ 
        ...prev, 
        [questionIndex]: "Sorry, we couldn't generate an explanation for this answer." 
      }));
    } finally {
      setIsGeneratingExplanation(false);
    }
  }, []);

  const handleAnswerSelect = useCallback((questionIndex: number, answer: string) => {
    if (showFeedback && selectedAnswers[questionIndex]) return; // Don't allow changing answer after feedback is shown
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowFeedback(true); // Show feedback immediately after selecting an answer
    
    // Generate explanation for this answer
    if (questions[questionIndex]) {
      generateExplanation(questionIndex, questions[questionIndex], answer);
    }
  }, [showFeedback, questions, generateExplanation, selectedAnswers]);

  const resetAnswers = useCallback(() => {
    setSelectedAnswers({});
    setExplanations({});
    setShowFeedback(false);
    setIsGeneratingExplanation(false);
  }, []);

  return {
    selectedAnswers,
    showFeedback,
    explanations,
    isGeneratingExplanation,
    handleAnswerSelect,
    resetAnswers,
    setShowFeedback
  };
};
