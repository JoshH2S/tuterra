
import { Course } from "@/types/course";

export interface ProcessedQuiz {
  id: string;
  title: string;
  creator: string;
  duration: string;
  previousScore: number;
  attemptNumber: number;
  totalQuestions: number;
  status: 'not_attempted' | 'in_progress' | 'completed';
  allowRetake: boolean;
}

export interface ProcessedCourse extends Course {
  quizzes: ProcessedQuiz[];
}

export interface QuizzesByCourse {
  [courseId: string]: Quiz[];
}

export interface Quiz {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  allow_retakes: boolean;
  user_id?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  latest_response?: {
    id: string;
    score: number;
    total_questions: number;
    attempt_number: number;
    user_id: string;
  };
}
