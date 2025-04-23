
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
  type?: string;
  // Adding these properties to match Quiz interface
  course_id?: string;
  duration_minutes?: number;
  allow_retakes?: boolean;
}

// Instead of extending Course, we'll make ProcessedCourse a separate interface
// that includes the Course properties plus the quizzes array
export interface ProcessedCourse {
  id: string;
  title: string;
  description?: string;
  code?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'archived';
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
  type?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  latest_response?: {
    id: string;
    score: number;
    total_questions: number;
    attempt_number: number;
    student_id: string;
    // Note: completed_at might exist in the database but isn't included in the fetched data
    // so we determine completion based on score instead
  };
  question_count?: number;
}
