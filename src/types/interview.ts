
// Core interview data types
export interface InterviewSession {
  id: string;
  userId?: string;
  jobTitle: string;
  industry: string;
  jobDescription?: string;
  status: 'created' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  question: string;
  questionOrder: number;
  createdAt: string;
}

export interface InterviewResponse {
  id?: string;
  questionId: string;
  response: string;
  createdAt?: string;
}

export interface InterviewFeedback {
  id?: string;
  sessionId: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  overallFeedback?: string;
  createdAt?: string;
}

// UI state types
export interface InterviewState {
  session: InterviewSession | null;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  responses: Record<string, string>;
  feedback: InterviewFeedback | null;
  status: 'idle' | 'loading' | 'ready' | 'in-progress' | 'completed' | 'error';
  error: string | null;
}

export interface IndustryOption {
  value: string;
  label: string;
}

export interface JobTitleOption {
  value: string;
  label: string;
}
