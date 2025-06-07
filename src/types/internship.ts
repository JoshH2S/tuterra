import { Json } from "@/integrations/supabase/types";

// Main internship session interface
export interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string;
  duration_weeks?: number;
  start_date?: string;
  current_phase: number;
  created_at: string;
  questions?: Json;
  is_completed?: boolean;
}

// Task interface
export interface InternshipTask {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  due_date: string;
  status: string;
  task_order: number;
  task_type?: string | null;
  created_at: string;
  submission?: TaskSubmission | null;
  visible_after?: string | null;
}

// Task submission interface
export interface TaskSubmission {
  id: string;
  response_text: string;
  created_at: string;
  overall_assessment?: string | null;
  feedback_provided_at?: string | null;
  quality_rating?: number | null;
  timeliness_rating?: number | null;
  collaboration_rating?: number | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  content_type?: 'text' | 'file' | 'both' | null;
}

// Event interface
export interface InternshipEvent {
  id: string;
  session_id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  created_at: string;
}

// Resource interface
export interface InternshipResource {
  id: string;
  session_id: string;
  title: string;
  description: string;
  url?: string | null;
  resource_type: string;
  created_at: string;
}

// Company information interface
export interface CompanyInfo {
  id: string;
  session_id: string;
  name: string;
  industry: string;
  description: string;
  mission: string;
  vision: string;
  values: Json;
  founded_year: string; // Changed from number to string to match database
  size: string;
  created_at: string;
  updated_at: string;
} 