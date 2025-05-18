
// If this file doesn't exist, we need to create it with the necessary types
export interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description?: string;
  created_at: string;
  current_phase: number;
  questions?: any[] | null;
}

export interface Task {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string;
  task_type?: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'feedback_given';
  task_order: number;
  created_at: string;
}

export interface Deliverable {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  submitted_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
}

export interface Feedback {
  id: string;
  deliverable_id: string;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  created_at: string;
}
