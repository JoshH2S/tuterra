
export interface InterviewSession {
  id: string;
  user_id: string;
  industry: string;
  job_role: string;
  job_description: string;
  created_at: string;
  updated_at: string;
  status: "created" | "in_progress" | "completed";
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  text: string;
  category: string;
  difficulty: string;
  estimatedTimeSeconds: number;
  keywords?: string[];
  question_order: number;
  created_at: string;
}

export interface InterviewResponse {
  id: string;
  question_id: string;
  user_response: string;
  created_at: string;
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewTranscript {
  question: string;
  answer: string;
}
