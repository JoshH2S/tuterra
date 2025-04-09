
import { QuestionDifficulty } from "./quiz";

export interface Topic {
  description: string;
  numQuestions: number;
}

export interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  topic: string;
  points: number;
  difficulty?: QuestionDifficulty;
  explanation?: string;
  caseStudy?: {
    source: string;
    date: string;
    context: string;
    url?: string;
  };
  analysisType?: string;
}

export interface CaseStudyQuestion extends Question {
  caseStudy: {
    source: string;
    date: string;
    context: string;
    url?: string;
  };
  analysisType: string;
}

export interface QuizSettings {
  title: string;
  duration: number;
  courseId?: string;
  difficulty: QuestionDifficulty;
}

export const CONTENT_LIMITS = {
  MAX_CONTENT_LENGTH: 50 * 1024 * 1024, // 50MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB for file uploads
  MAX_CHARACTERS: 50_000,
  WARNING_THRESHOLD: 25_000
};

export const isCaseStudyQuestion = (question: Question): question is CaseStudyQuestion => {
  return question.caseStudy !== undefined;
};
