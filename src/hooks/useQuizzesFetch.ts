
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizzesByCourse } from "@/types/quiz-display";

export const useQuizzesFetch = () => {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchQuizzes = async (newPage?: number) => {
    try {
      setLoading(true);
      const currentPage = newPage !== undefined ? newPage : page;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Select only necessary fields instead of *
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          course_id,
          published,
          duration_minutes,
          allow_retakes,
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
        .eq('published', true)
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if there are more quizzes
      const { count, error: countError } = await supabase
        .from('quizzes')
        .select('id', { count: 'exact', head: true })
        .eq('published', true);

      if (countError) throw countError;
      
      setHasMore(count ? (currentPage + 1) * PAGE_SIZE < count : false);
      
      const quizzesByCourseTmp: QuizzesByCourse = {};
      data.forEach((quiz: any) => {
        // Filter responses to only include current user's attempts
        const userResponses = quiz.quiz_responses.filter(
          (response: any) => response.student_id === user.id
        );

        // Sort responses by attempt number in descending order (newest first)
        const sortedResponses = userResponses.sort((a: any, b: any) => 
          b.attempt_number - a.attempt_number
        );
        
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
      
      // If loading more, append to existing data; otherwise replace it
      if (newPage !== undefined && newPage > 0) {
        // Merge with existing data
        setQuizzesByCourse(prev => {
          const merged = { ...prev };
          
          // Append new quizzes to existing courses
          Object.keys(quizzesByCourseTmp).forEach(courseId => {
            if (merged[courseId]) {
              merged[courseId] = [...merged[courseId], ...quizzesByCourseTmp[courseId]];
            } else {
              merged[courseId] = quizzesByCourseTmp[courseId];
            }
          });
          
          return merged;
        });
        setPage(currentPage);
      } else {
        // Replace with new data
        setQuizzesByCourse(quizzesByCourseTmp);
        setPage(0);
      }
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

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchQuizzes(page + 1);
    }
  };

  return {
    quizzesByCourse,
    loading,
    fetchQuizzes,
    hasMore,
    loadMore
  };
};
