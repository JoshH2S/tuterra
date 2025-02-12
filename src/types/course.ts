
export interface Course {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseMaterial {
  id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  size: number;
  course_id: string;
  created_at?: string;
  updated_at?: string;
}
