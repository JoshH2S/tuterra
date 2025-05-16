
export type QuestionDifficulty = 'middle_school' | 'high_school' | 'university' | 'post_graduate';

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
