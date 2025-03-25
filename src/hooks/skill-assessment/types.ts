
import { Json } from "@/integrations/supabase/types";

// Type definitions for the assessment and questions
export type SkillAssessment = {
  id: string;
  title: string;
  industry: string;
  role: string;
  description: string;
  questions: Array<QuestionItem>;
  time_limit?: number;
  level?: string;
  tier?: string;
};

export type QuestionItem = {
  question: string;
  type: string;
  options: Record<string, string>;
  correctAnswer: string | string[];
  skill?: string;
};

export type QuestionResult = {
  question: string;
  correct: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  skill: string;
};

export type SkillScores = Record<string, { correct: number; total: number; score: number }>;

// Type for the hook return values
export type AssessmentTakingState = {
  assessment: SkillAssessment | null;
  loading: boolean;
  currentQuestionIndex: number;
  answers: Record<number, string | string[]>;
  timeRemaining: number;
  totalTime: number;
  isSubmitting: boolean;
  error: string | null;
  submissionProgress: number;
  sections: Array<{ id: string; label: string; weight: number }>;
  progress: number;
  isLastQuestion: boolean;
  currentQuestion: QuestionItem | undefined;
  totalQuestions: number;
  handleAnswerChange: (value: string | string[]) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  handleSubmit: () => void;
  setError: (error: string | null) => void;
};

// Type guards for answers validation
export const isValidAnswer = (answer: unknown): answer is string | string[] => {
  return typeof answer === 'string' || 
    (Array.isArray(answer) && answer.every(item => typeof item === 'string'));
};

export const validateAnswers = (answers: Record<number, unknown>): boolean => {
  return Object.values(answers).every(answer => isValidAnswer(answer));
};
