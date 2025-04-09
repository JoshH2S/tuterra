
// Define types used throughout the application

export type QuestionDifficulty = "middle_school" | "high_school" | "university" | "post_graduate";

export interface DifficultyGuideline {
  complexity: string;
  language: string;
  points: { min: number; max: number };
}

export interface Topic {
  description: string;
  numQuestions: number;
}

export interface ContentChunk {
  content: string;
  topics: Topic[];
  startIndex: number;
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
  explanation: string;
  difficulty: QuestionDifficulty;
  conceptTested: string;
  learningObjective: string;
  formula?: string; // Optional LaTeX formula for STEM questions
  visualizationPrompt?: string; // Optional description for visualization
  generatedBy?: string; // Which model generated this question
  [key: string]: any; // For additional properties
}

export interface QuizMetadata {
  topics: string[];
  difficulty: QuestionDifficulty;
  totalPoints: number;
  estimatedDuration: number;
  modelsUsed?: string[]; // Track which models were used
  stemTopicsDetected?: boolean; // Whether STEM topics were detected
}

export interface QuizResponse {
  quizQuestions: Question[];
  metadata: QuizMetadata;
}

export type ModelType = "openai" | "deepseek";
