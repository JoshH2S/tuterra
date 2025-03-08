
import { QuizQuestion } from "@/hooks/quiz/quizTypes";

export interface AIFeedback {
  strengths: string[];
  areas_for_improvement: string[];
  advice: string;
}

export interface QuestionResponse {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  topic: string;
  question: QuizQuestion | null;
}

export interface QuizResponse {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string | null;
  topic_performance: Record<string, { correct: number; total: number }> | null;
  ai_feedback: AIFeedback | null;
  attempt_number: number;
  question_responses: QuestionResponse[];
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  title: string;
  allow_retakes: boolean;
}

export interface ProcessedQuestion extends QuizQuestion {
  studentAnswer: string;
  isCorrect: boolean;
}
