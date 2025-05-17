
// Type definitions for the generate-interview-questions edge function

export interface RequestBody {
  industry: string;
  jobTitle: string;   // Primary parameter
  jobRole?: string;   // Support legacy parameter
  role?: string;      // Support legacy parameter
  jobDescription?: string;
  sessionId: string;
}

export interface EdgeFunctionResponse {
  success: boolean;
  sessionId: string;
  questions: any[];
  requirements?: string[];
  sessionType?: "interview" | "internship";
}

export interface EnhancedInterviewQuestion {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'role-specific' | 'situational' | 'problem-solving';
  difficulty: 'entry' | 'intermediate' | 'advanced';
  estimatedTimeSeconds: number;
  context?: string;
  keywords: string[];
  question_order: number;
  created_at: string;
}
