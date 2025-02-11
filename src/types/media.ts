
export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  metadata?: Record<string, any>;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseTemplate {
  id: string;
  title: string;
  description?: string;
  content: Record<string, any>;
  metadata?: Record<string, any>;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}
