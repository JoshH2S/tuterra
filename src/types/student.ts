
export interface StudentCourse {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  last_accessed: string;
  status: 'active' | 'completed' | 'dropped';
  course: {
    title: string;
    description: string | null;
  };
}

export interface StudentPerformance {
  id: string;
  student_id: string;
  course_id: string;
  total_quizzes: number;
  completed_quizzes: number;
  average_score: number;
  last_activity: string;
  course_title?: string;
  courses?: {
    title: string;
  };
  strengths?: string[];
  areas_for_improvement?: string[];
}
