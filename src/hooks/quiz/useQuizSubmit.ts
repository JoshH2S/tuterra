
import { useState } from "react";
import { QuizQuestion } from "./quizTypes";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useQuizSubmit = (
  quizId: string,
  questions: QuizQuestion[],
  onQuizSubmitted: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuiz = async (selectedAnswers: Record<number, string>) => {
    if (!quizId) {
      toast({
        title: "Error",
        description: "No quiz ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate the score
      let correctAnswers = 0;
      const questionResponses = questions.map((question, index) => {
        const userAnswer = selectedAnswers[index] || "";
        const isCorrect = userAnswer === question.correct_answer;
        
        if (isCorrect) {
          correctAnswers += 1;
        }
        
        return {
          question_id: question.id,
          student_answer: userAnswer,
          is_correct: isCorrect,
        };
      });

      const score = (correctAnswers / questions.length) * 100;

      // Save the quiz response to the database
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("quiz_responses").insert({
        quiz_id: quizId,
        student_id: userData.user.id,
        score: Math.round(score),
        correct_answers: correctAnswers,
        total_questions: questions.length,
        question_responses: questionResponses,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Quiz Submitted",
        description: `Your score: ${Math.round(score)}%`,
      });

      // Call the callback function to notify parent components
      onQuizSubmitted();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitQuiz,
  };
};
