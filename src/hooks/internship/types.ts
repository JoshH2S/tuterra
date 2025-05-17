
import { ReactNode } from 'react';

// Types
export type InternshipSession = {
  id: string;
  job_title: string;
  industry: string;
  user_id: string;
  created_at: string;
  current_phase: number;
  job_description?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'feedback_given';
  task_type: string;
  task_order: number;
  instructions: string;
};

export type Deliverable = {
  id: string;
  task_id: string;
  content: string;
  submitted_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
  user_id?: string;
};

export type Feedback = {
  id: string;
  deliverable_id: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
};

export type ErrorState = {
  message: string;
  code?: string;
  details?: string;
  retryFn?: () => Promise<any>; // Accepts any Promise return type
};

// Context Type
export type InternshipContextType = {
  session: InternshipSession | null;
  tasks: Task[];
  deliverables: Record<string, Deliverable>;
  feedbacks: Record<string, Feedback>;
  loading: boolean;
  loadingPhase: boolean;
  error: ErrorState | null;
  fetchSession: (sessionId: string) => Promise<InternshipSession | null>;
  fetchTasks: (sessionId: string) => Promise<void>;
  fetchDeliverables: (taskIds: string[]) => Promise<void>;
  createInternshipSession: (jobTitle: string, industry: string, jobDescription: string) => Promise<string | null>;
  submitTask: (task: Task, content: string, attachmentUrl: string | null, attachmentName: string | null) => Promise<boolean>;
  completePhase: (sessionId: string, phaseNumber: number) => Promise<boolean>;
  resumeTask: (taskId: string) => Promise<boolean>;
  clearError: () => void;
  validateSessionAccess: (sessionId: string) => Promise<boolean>;
};
