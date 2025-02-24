
export type QuestionDifficulty = 'middle_school' | 'high_school' | 'university' | 'post_graduate';

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
  explanation?: string;
  difficulty: QuestionDifficulty;
}

export const DIFFICULTY_COLORS = {
  middle_school: 'bg-green-100 text-green-800',
  high_school: 'bg-blue-100 text-blue-800',
  university: 'bg-purple-100 text-purple-800',
  post_graduate: 'bg-red-100 text-red-800',
} as const;
