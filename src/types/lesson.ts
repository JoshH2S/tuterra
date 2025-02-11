
export interface Objective {
  description: string;
  days: number;
}

export interface LessonPlan {
  content: string;
  objectives: Objective[];
  teacherName?: string;
  school?: string;
}
