
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

      console.log("Fetching quizzes for user ID:", user.id);

      // Get all courses the user is enrolled in
      const { data: enrolledCourses, error: enrollmentError } = await supabase
        .from('student_courses')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollmentError) {
        console.error("Error fetching enrolled courses:", enrollmentError);
      }

      // Get courses created by the user
      const { data: createdCourses, error: createdCoursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', user.id);

      if (createdCoursesError) {
        console.error("Error fetching created courses:", createdCoursesError);
      }

      // Create a set of all course IDs the user can access
      const enrolledCourseIds = enrolledCourses?.map(c => c.course_id) || [];
      const createdCourseIds = createdCourses?.map(c => c.id) || [];
      const allCourseIds = [...new Set([...enrolledCourseIds, ...createdCourseIds])];

      console.log("User's courses:", allCourseIds);

      // Fetch quizzes that are either:
      // 1. Created by the user, OR
      // 2. Associated with courses the user created or is enrolled in
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
        .or(`user_id.eq.${user.id},${allCourseIds.length > 0 ? `course_id.in.(${allCourseIds.join(',')})` : 'course_id.is.null'}`)
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching quizzes:", error);
        throw error;
      }

      // Log fetched quizzes for debugging
      console.log("Fetched quizzes:", data.length);
      
      // Check if there are more quizzes
      const { count, error: countError } = await supabase
        .from('quizzes')
        .select('id', { count: 'exact', head: true })
        .eq('published', true)
        .or(`user_id.eq.${user.id},${allCourseIds.length > 0 ? `course_id.in.(${allCourseIds.join(',')})` : 'course_id.is.null'}`);

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

        if (!quizzesByCourseTmp[quiz.course_id || 'no_course']) {
          quizzesByCourseTmp[quiz.course_id || 'no_course'] = [];
        }
        quizzesByCourseTmp[quiz.course_id || 'no_course'].push(processedQuiz);
      });
      
      console.log("Processed quizzes by course:", quizzesByCourseTmp);
      
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
