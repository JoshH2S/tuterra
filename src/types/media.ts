
import { Json } from "@/integrations/supabase/types";

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  metadata?: Json | null;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseTemplate {
  id: string;
  title: string;
  description?: string;
  content: Json;  // Changed from Record<string, any> to Json
  metadata?: Json | null;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}
