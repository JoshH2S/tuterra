
export interface TopicPerformance {
  [topic: string]: { 
    total: number; 
    correct: number;
  }
}

export interface QuestionResponse {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  topic: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correct_answer: string;
  options: Record<string, string>;
  topic: string;
  explanation?: string;
  difficulty: string;
}

export interface Quiz {
  title: string;
  quiz_questions: QuizQuestion[];
}

export interface QuizResponse {
  id: string;
  quiz_id: string;
  student_id: string;
  quiz: Quiz;
  score: number;
  question_responses: QuestionResponse[];
  topic_performance: TopicPerformance;
  ai_feedback?: AIFeedback;
}

export interface AIFeedback {
  strengths: string[];
  areas_for_improvement: string[];
  advice: string;
}

export interface AnalysisData {
  topicResponses: Record<string, { total: number, correct: number }>;
  difficultyResponses: Record<string, { total: number, correct: number }>;
  commonMistakes: { topic: string, difficulty: string }[];
  correctAnswers: { question: string, topic: string, difficulty: string }[];
  incorrectAnswers: { 
    question: string, 
    studentAnswer: string, 
    correctAnswer: string, 
    topic: string, 
    difficulty: string,
    explanation?: string 
  }[];
}
