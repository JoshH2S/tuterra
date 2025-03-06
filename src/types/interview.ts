
export type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export type QuestionCategory = 'Technical' | 'Behavioral' | 'Situational' | 'Experience' | 'Core' | 'Problem Solving' | 'Cultural Fit';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'easy' | 'medium' | 'hard';

export type Question = {
  id: string;
  text: string;
  category?: QuestionCategory;
  difficulty?: QuestionDifficulty;
  estimatedTimeSeconds?: number;
  keywords?: string[];
  orderIndex?: number;
};

export interface QuestionCategoryConfig {
  id: string;
  name: QuestionCategory;
  weight: number; // Percentage of questions to generate from this category
}

export interface InterviewConfig {
  industry: string;
  role: string;
  jobDescription: string;
  numberOfQuestions?: number;
  timeLimit?: number; // in minutes
  categories?: QuestionCategoryConfig[];
}

export interface GenerateQuestionsResponse {
  questions: Question[];
  metadata?: {
    totalTime: number;
    categoryBreakdown: Record<QuestionCategory, number>;
  };
}

// Fallback questions in case API fails or returns too few questions
export const FALLBACK_QUESTIONS = [
  "Tell me about your experience with similar roles in the past.",
  "How do you handle challenging situations in the workplace?",
  "What are your greatest strengths related to this position?",
  "Describe a time when you had to learn a new skill quickly.",
  "Where do you see yourself professionally in five years?"
];
