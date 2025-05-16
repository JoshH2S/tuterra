
import { QuestionDifficulty } from "./quiz";

export interface Topic {
  description: string;
  numQuestions: number;
}

export interface Question {
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
  difficulty?: QuestionDifficulty;
  explanation?: string;
  caseStudy?: {
    source: string;
    date: string;
    context: string;
    url?: string;
  };
  analysisType?: string;
  conceptTested?: string;
  formula?: string; // Optional LaTeX formula for STEM questions
  visualizationPrompt?: string; // Optional description for visualization
  generatedBy?: string; // Which model generated this question
}

export interface CaseStudyQuestion extends Question {
  caseStudy: {
    source: string;
    date: string;
    context: string;
    url?: string;
  };
  analysisType: string;
}

export interface QuizSettings {
  title: string;
  duration: number;
  courseId?: string;
  difficulty: QuestionDifficulty;
}

// Using central file limits
export { FILE_LIMITS as CONTENT_LIMITS } from "@/utils/file-limits";

export const isCaseStudyQuestion = (question: Question): question is CaseStudyQuestion => {
  return question.caseStudy !== undefined;
};

export const isRegularQuestion = (question: Question): boolean => {
  return !isCaseStudyQuestion(question);
};

// Utility function to safely convert a question to Supabase-compatible format
export const toSupabaseQuestionFormat = (question: Question) => {
  return {
    id: question.id,
    quiz_id: null, // This will be set during insertion
    question: question.question,
    options: question.options,
    correct_answer: question.correctAnswer,
    topic: question.topic,
    points: question.points || 1,
    difficulty: question.difficulty || 'intermediate',
    explanation: question.explanation,
    question_type: 'multiple_choice' // Default question type
  };
};

// Utility function to format the topic_performance object for Supabase
export const formatTopicPerformance = (
  questions: Question[], 
  selectedAnswers: Record<number, string>
): Record<string, { correct: number; total: number }> => {
  const topicPerformance: Record<string, { correct: number; total: number }> = {};
  
  questions.forEach((question, index) => {
    const topic = question.topic || 'general';
    const userAnswer = selectedAnswers[index] || '';
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { correct: 0, total: 0 };
    }
    
    topicPerformance[topic].total += 1;
    if (isCorrect) {
      topicPerformance[topic].correct += 1;
    }
  });
  
  return topicPerformance;
};
