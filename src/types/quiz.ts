
export type QuestionDifficulty = 'middle_school' | 'high_school' | 'university' | 'post_graduate';

export interface Topic {
  description: string;
  numQuestions: number;
}

export interface BaseQuestion {
  id?: string;
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
}

export interface Question extends BaseQuestion {
  difficulty: QuestionDifficulty;
}

export interface CaseStudyQuestion extends BaseQuestion {
  difficulty: QuestionDifficulty;
  caseStudy: {
    source: string;
    date: string;
    context: string;
    url?: string;
  };
  analysisType: "critical_thinking" | "application" | "evaluation" | "synthesis";
}

export interface RegularQuestion extends BaseQuestion {
  difficulty: QuestionDifficulty;
  conceptTested: string;
  learningObjective: string;
}

export interface QuizMetadata {
  courseId: string;
  difficulty: QuestionDifficulty;
  topics: string[];
  totalPoints: number;
  estimatedDuration: number;
}

export const DIFFICULTY_COLORS = {
  middle_school: 'bg-green-100 text-green-800',
  high_school: 'bg-blue-100 text-blue-800',
  university: 'bg-purple-100 text-purple-800',
  post_graduate: 'bg-red-100 text-red-800',
} as const;
