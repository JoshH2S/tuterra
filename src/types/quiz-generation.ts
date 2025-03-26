
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
  difficulty: QuestionDifficulty;
}

export interface QuizSettings {
  title: string;
  duration: number;
  courseId?: string;
  difficulty: QuestionDifficulty;
}

export const CONTENT_LIMITS = {
  MAX_CHARACTERS: 75_000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  OPTIMAL_CHUNK_SIZE: 8_000,
  WARNING_THRESHOLD: 50_000
};
