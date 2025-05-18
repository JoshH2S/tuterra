
// If this file doesn't exist, we need to create it with the necessary types
export interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description?: string;
  created_at: string;
  current_phase: number;
  questions?: any[];
}
