
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Question } from "@/types/quiz-generation";
import { useNavigate } from "react-router-dom";

export const useQuizSave = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const saveQuizToDatabase = async (
    questions: Question[],
    title: string,
    duration: number,
    courseId?: string
  ) => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return { success: false, quizId: null };
      }

      // Create the quiz with title, user_id, and duration
      const quizData = {
        title: title || `Quiz - ${new Date().toLocaleDateString()}`,
        user_id: session.user.id,
        duration_minutes: duration
      };

      // Only add course_id if it exists
      if (courseId) {
        Object.assign(quizData, { course_id: courseId });
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (quizError) throw quizError;

      // Insert all questions
      const questionsToInsert = questions.map(q => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correctAnswer,
        topic: q.topic,
        points: q.points,
        options: q.options
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      setQuizId(quiz.id);
      
      return { success: true, quizId: quiz.id };
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
      return { success: false, quizId: null };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    quizId,
    error,
    saveQuizToDatabase
  };
};
