
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

          // Match the score calculation from the quiz results page
          // In quiz results, the score is displayed directly from the response score field
          let scorePercentage = 0;
          if (latestResponse && latestResponse.total_questions > 0) {
            // Use the score directly as stored in the response
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
            status: latestResponse ? 'completed' : 'not_attempted',
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
