
import { InterviewQuestion } from "@/types/interview";

export interface QuestionGenerationParams {
  industry?: string;
  jobRole: string;    // We'll keep this named jobRole for now to minimize changes
  jobDescription: string;
  sessionId: string;
  practiceMode?: "specific-job" | "general-practice";
}

export interface EdgeFunctionResponse {
  success: boolean;
  sessionId: string;
  questions: any[];
  requirements?: string[];
}

export interface QuestionHookReturn {
  generateQuestions: (industry: string | undefined, jobRole: string, jobDescription: string, sessionId: string) => Promise<InterviewQuestion[]>;
  generateFallbackQuestions: (jobRole: string, industry?: string) => Promise<InterviewQuestion[]>;
  fetchQuestions: (sessionIdOverride?: string) => Promise<void>;
  loading: boolean;
}
