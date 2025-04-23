
export interface Course {
  id: string;
  title: string;
  description?: string;
  code?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'archived';
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  size: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentCourse {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  last_accessed: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface CourseCreateData {
  title: string;
  description?: string;
  // Note: code is kept in the type but not used for database insertion
  // as it's not in the courses table schema
  code?: string;
}
