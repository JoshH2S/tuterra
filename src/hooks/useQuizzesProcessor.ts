import { useEffect, useState, useCallback } from "react";
import { Course } from "@/types/course";
import { ProcessedCourse, ProcessedQuiz, QuizzesByCourse } from "@/types/quiz-display";
import { supabase } from "@/integrations/supabase/client";

export const useQuizzesProcessor = (
  courses: Course[] = [], 
  quizzesByCourse: QuizzesByCourse = {}
) => {
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);

  // Sync completed quizzes to student_quiz_scores table
  const syncCompletedQuizzes = useCallback(async (completedQuizzes: {
    quizId: string;
    courseId: string;
    score: number;
    totalQuestions: number;
  }[]) => {
    if (!completedQuizzes.length) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // For each completed quiz, ensure it exists in student_quiz_scores
      for (const quiz of completedQuizzes) {
        // Check if this quiz already exists in student_quiz_scores
        const { data: existingScore } = await supabase
          .from('student_quiz_scores')
          .select('id')
          .eq('student_id', user.id)
          .eq('quiz_id', quiz.quizId)
          .eq('course_id', quiz.courseId)
          .maybeSingle();
        
        if (!existingScore) {
          // Insert new score record
          await supabase
            .from('student_quiz_scores')
            .insert({
              student_id: user.id,
              quiz_id: quiz.quizId,
              course_id: quiz.courseId,
              score: quiz.score,
              max_score: 100, // Scores are percentages
              taken_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Error syncing quiz scores:', error);
    }
  }, []);

  useEffect(() => {
    if (!courses) {
      console.log("No courses provided to useQuizzesProcessor");
      setProcessedCourses([]);
      return;
    }
    
    if (!quizzesByCourse || Object.keys(quizzesByCourse).length === 0) {
      console.log("No quizzes by course provided to useQuizzesProcessor");
      setProcessedCourses([]);
      return;
    }
    
    const completedQuizzes: { quizId: string; courseId: string; score: number; totalQuestions: number }[] = [];
    
    const processed = courses.map(course => {
      const courseQuizzes = quizzesByCourse[course.id] || [];
      
      const processedQuizzes: ProcessedQuiz[] = courseQuizzes.map(quiz => {
        // Get the latest response (already filtered and sorted)
        const latestResponse = quiz.latest_response;

        // Determine quiz status
        // Since completed_at doesn't exist in the type, we'll use the score to determine status
        let status: 'not_attempted' | 'in_progress' | 'completed' = 'not_attempted';
        if (latestResponse) {
          // If there's a response with a score, consider it completed
          // Otherwise it's in progress
          status = latestResponse.score > 0 ? 'completed' : 'in_progress';
          
          // Add to completed quizzes array for syncing
          if (status === 'completed') {
            completedQuizzes.push({
              quizId: quiz.id,
              courseId: course.id,
              score: latestResponse.score,
              totalQuestions: latestResponse.total_questions
            });
          }
        }

        // Match the score calculation from the quiz results page
        let scorePercentage = 0;
        if (latestResponse && latestResponse.total_questions > 0) {
          scorePercentage = latestResponse.score;
        }
          
        return {
          id: quiz.id,
          title: quiz.title,
          creator: quiz.profiles ? `${quiz.profiles.first_name} ${quiz.profiles.last_name}` : 'Anonymous',
          duration: quiz.duration_minutes > 0 ? `${quiz.duration_minutes} minutes` : 'No time limit',
          previousScore: scorePercentage,
          attemptNumber: latestResponse?.attempt_number || 0,
          totalQuestions: latestResponse?.total_questions || quiz.question_count || 10,
          status,
          allowRetake: quiz.allow_retakes
        };
      });
      
      return {
        ...course,
        quizzes: processedQuizzes
      };
    });
    
    setProcessedCourses(processed.filter(course => course.quizzes.length > 0));
    
    // Sync completed quizzes to student_quiz_scores table
    if (completedQuizzes.length > 0) {
      syncCompletedQuizzes(completedQuizzes);
    }
  }, [courses, quizzesByCourse, syncCompletedQuizzes]);

  return { processedCourses };
};
