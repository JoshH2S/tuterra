
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
