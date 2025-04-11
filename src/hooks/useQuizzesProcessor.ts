import { useEffect, useState } from "react";
import { Course } from "@/types/course";
import { ProcessedCourse, ProcessedQuiz, QuizzesByCourse } from "@/types/quiz-display";

export const useQuizzesProcessor = (
  courses: Course[], 
  quizzesByCourse: QuizzesByCourse
) => {
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);

  useEffect(() => {
    if (courses.length > 0 && Object.keys(quizzesByCourse).length > 0) {
      const processed = courses.map(course => {
        const courseQuizzes = quizzesByCourse[course.id] || [];
        
        const processedQuizzes: ProcessedQuiz[] = courseQuizzes.map(quiz => {
          // Get the latest response (already filtered and sorted)
          const latestResponse = quiz.latest_response;
          
          console.log(`Processing quiz ${quiz.id}:`, {
            latestResponse,
            quiz
          });

          // Determine quiz status
          // Since completed_at doesn't exist in the type, we'll use the score to determine status
          let status: 'not_attempted' | 'in_progress' | 'completed' = 'not_attempted';
          if (latestResponse) {
            // If there's a response with a score, consider it completed
            // Otherwise it's in progress
            status = latestResponse.score > 0 ? 'completed' : 'in_progress';
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
      
      console.log('Final processed courses:', processed);
      setProcessedCourses(processed.filter(course => course.quizzes.length > 0));
    }
  }, [courses, quizzesByCourse]);

  return { processedCourses };
};
