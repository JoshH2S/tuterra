
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizzesByCourse } from "@/types/quiz-display";

export const useQuizzesFetch = () => {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log the query for debugging
      console.log("Fetching quizzes for user:", user.id);

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          ),
          quiz_responses!quiz_responses_quiz_id_fkey (
            id,
            score,
            total_questions,
            attempt_number,
            student_id
          )
        `)
        .eq('published', true);

      if (error) throw error;

      // Log the received data for debugging
      console.log("Raw quiz data:", data);

      const quizzesByCourseTmp: QuizzesByCourse = {};
      data.forEach((quiz: any) => {
        // Filter responses to only include current user's attempts
        const userResponses = quiz.quiz_responses.filter(
          (response: any) => response.student_id === user.id
        );

        console.log(`Quiz ${quiz.id} user responses:`, userResponses);

        // Sort responses by attempt number in descending order (newest first)
        const sortedResponses = userResponses.sort((a: any, b: any) => 
          b.attempt_number - a.attempt_number
        );
        
        console.log(`Quiz ${quiz.id} sorted responses:`, sortedResponses);
        
        // Take only the latest attempt
        const latestResponse = sortedResponses.length > 0 ? sortedResponses[0] : undefined;
        
        const processedQuiz: Quiz = {
          ...quiz,
          latest_response: latestResponse,
        };

        if (!quizzesByCourseTmp[quiz.course_id]) {
          quizzesByCourseTmp[quiz.course_id] = [];
        }
        quizzesByCourseTmp[quiz.course_id].push(processedQuiz);
      });
      
      // Log the processed quizzes by course
      console.log("Processed quizzes by course:", quizzesByCourseTmp);
      
      setQuizzesByCourse(quizzesByCourseTmp);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    quizzesByCourse,
    loading,
    fetchQuizzes
  };
};
