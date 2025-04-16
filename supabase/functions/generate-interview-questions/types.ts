
// Type definitions for the generate-interview-questions edge function

export interface RequestBody {
  industry: string;
  jobRole?: string;  // Support legacy parameter
  role?: string;     // Support legacy parameter
  jobTitle?: string; // Add support for jobTitle parameter
  jobDescription?: string;
  sessionId: string;
}

export interface EdgeFunctionResponse {
  success: boolean;
  sessionId: string;
  questions: any[];
  requirements?: string[];
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
