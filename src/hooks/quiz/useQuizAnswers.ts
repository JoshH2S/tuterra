
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "./quizTypes";
import { toast } from "@/components/ui/use-toast";

export const useQuizAnswers = (questions: QuizQuestion[]) => {
  // Initialize with empty object to ensure no pre-selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);
  
  // Use a ref to track pending explanation requests
  const pendingExplanations = useRef<Record<number, boolean>>({});

  // Toggle expanded feedback
  const toggleFeedback = useCallback((questionIndex: number) => {
    setExpandedFeedback(prev => prev === questionIndex ? null : questionIndex);
  }, []);

  // Generate an explanation for the answer with improved mobile UX
  const generateExplanation = useCallback(async (
    questionIndex: number, 
    question: QuizQuestion, 
    selectedAnswer: string
  ) => {
    if (!question) return;
    
    // If this question already has a pending explanation request, don't start another
    if (pendingExplanations.current[questionIndex]) {
      console.log("Explanation already being generated for question", questionIndex);
      return;
    }
    
    // If there's already an explanation from the database, use that
    if (question.explanation) {
      console.log("Using existing explanation from the database");
      setExplanations(prev => ({ ...prev, [questionIndex]: question.explanation! }));
      return;
    }
    
    // Mark this question as having a pending explanation
    pendingExplanations.current[questionIndex] = true;
    setIsGeneratingExplanation(true);
    
    try {
      const isCorrect = selectedAnswer === question.correct_answer;
      const selectedText = question.options[selectedAnswer] || "No answer selected";
      const correctText = question.options[question.correct_answer] || "No correct answer found";
      
      console.log(`Generating explanation for question: "${question.question.substring(0, 30)}..."`);
      console.log(`Student selected: ${selectedAnswer} (${selectedText}), correct: ${isCorrect}`);
      
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
          
          Your explanation should be educational and help the student understand the concept better. Keep it concise for mobile readability.`,
          temperature: 0.7,
          max_tokens: 200
        }
      });
      
      if (error) {
        console.error("OpenAI function invocation error:", error);
        throw error;
      }
      
      if (data && data.response) {
        setExplanations(prev => ({ ...prev, [questionIndex]: data.response }));
        console.log("Successfully saved explanation for question", questionIndex);
        
        // Automatically expand the first explanation when it's generated
        if (Object.keys(explanations).length === 0) {
          setExpandedFeedback(questionIndex);
        }
      } else {
        console.error("No response received from OpenAI", data);
        throw new Error("No explanation returned from AI");
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Set a fallback explanation if the AI fails
      let fallbackMessage = "We couldn't generate a detailed explanation for this answer right now. The correct answer is based on the course materials covered.";
      
      // If the error response has a fallback message, use that
      if (error.fallbackResponse) {
        fallbackMessage = error.fallbackResponse;
      }
      
      setExplanations(prev => ({ 
        ...prev, 
        [questionIndex]: fallbackMessage 
      }));
      
      toast({
        title: "Explanation Generation Failed",
        description: "We couldn't generate a detailed explanation. A basic explanation has been provided instead.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingExplanation(false);
      // Mark this question as no longer having a pending explanation
      pendingExplanations.current[questionIndex] = false;
    }
  }, [explanations]);

  const handleAnswerSelect = useCallback((questionIndex: number, answer: string) => {
    if (showFeedback && selectedAnswers[questionIndex]) return; // Don't allow changing answer after feedback is shown
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowFeedback(true); // Show feedback immediately after selecting an answer
    
    // Generate explanation for this answer
    if (questions[questionIndex]) {
      console.log("Generating explanation for answer to question", questionIndex);
      generateExplanation(questionIndex, questions[questionIndex], answer);
    }
  }, [showFeedback, questions, generateExplanation, selectedAnswers]);

  const resetAnswers = useCallback(() => {
    setSelectedAnswers({});
    setExplanations({});
    setShowFeedback(false);
    setIsGeneratingExplanation(false);
    setExpandedFeedback(null);
    pendingExplanations.current = {};
  }, []);

  return {
    selectedAnswers,
    showFeedback,
    explanations,
    isGeneratingExplanation,
    expandedFeedback,
    handleAnswerSelect,
    toggleFeedback,
    resetAnswers,
    setShowFeedback
  };
};
