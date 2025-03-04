
export type QuestionDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string;
  points: number;
  difficulty: QuestionDifficulty;
  explanation?: string;
}
