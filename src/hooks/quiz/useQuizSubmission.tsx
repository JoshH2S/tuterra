
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";

export const useQuizSubmit = (quizId: string, questions: QuizQuestion[], onQuizSubmitted: () => void) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmitQuiz = async (selectedAnswers: Record<number, string>) => {
    try {
      setIsSubmitting(true);
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a quiz",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach((question, index) => {
        const selectedAnswer = selectedAnswers[index];
        if (selectedAnswer === question.correct_answer) {
          correctAnswers++;
          totalPoints += question.points || 1;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Create quiz response
      const { data: response, error } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quizId,
          student_id: userId,
          score,
          answers: selectedAnswers,
          completed_at: new Date().toISOString(),
          total_questions: questions.length,
          correct_answers: correctAnswers,
          total_points: totalPoints
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Quiz Submitted",
        description: `Your score: ${score}%`,
      });
      
      onQuizSubmitted();
      navigate(`/quiz-results/${response.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
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
    handleSubmitQuiz
  };
};
