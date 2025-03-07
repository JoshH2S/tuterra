
import { InterviewQuestion } from "@/types/interview";

export interface QuestionGenerationParams {
  industry: string;
  jobRole: string;
  jobDescription: string;
  sessionId: string;
}

export interface EdgeFunctionResponse {
  success: boolean;
  sessionId: string;
  questions: any[];
  requirements?: string[];
}

export interface QuestionHookReturn {
  generateQuestions: (industry: string, jobRole: string, jobDescription: string, sessionId: string) => Promise<InterviewQuestion[]>;
  generateFallbackQuestions: (jobRole: string, industry: string) => Promise<InterviewQuestion[]>;
  fetchQuestions: () => Promise<void>;
  loading: boolean;
}
