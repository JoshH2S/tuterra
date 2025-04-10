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

// Type guard to check if a question is a RegularQuestion
export const isRegularQuestion = (question: Question): question is RegularQuestion => {
  return 'conceptTested' in question;
};

// Type guard to check if a question is a CaseStudyQuestion
export const isCaseStudyQuestion = (question: Question): question is CaseStudyQuestion => {
  return 'caseStudy' in question && 'analysisType' in question;
};

export interface QuizMetadata {
  courseId: string;
  difficulty: QuestionDifficulty;
  topics: string[];
  totalPoints: number;
  estimatedDuration: number;
  stemTopicsDetected?: boolean;
  modelUsed?: string;
}

export const DIFFICULTY_COLORS = {
  middle_school: 'bg-green-100 text-green-800',
  high_school: 'bg-blue-100 text-blue-800',
  university: 'bg-purple-100 text-purple-800',
  post_graduate: 'bg-red-100 text-red-800',
} as const;
