
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

export const MAX_CONTENT_LENGTH = 50 * 1024 * 1024; // 50MB
