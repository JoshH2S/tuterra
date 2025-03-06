
import { Question } from "@/types/interview";

export class QuestionValidationService {
  validateQuestions(questions: Question[]): boolean {
    return questions.every(q => 
      q.id &&
      q.text &&
      (q.category === undefined || typeof q.category === 'string') &&
      (q.estimatedTimeSeconds === undefined || q.estimatedTimeSeconds > 0) &&
      (q.difficulty === undefined || ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'].includes(q.difficulty))
    );
  }
  
  validateAndFilterQuestions(questions: Question[]): Question[] {
    return questions.filter(q => 
      q && 
      q.id && 
      q.text && 
      typeof q.text === 'string' && 
      q.text.trim() !== ''
    );
  }
}

export const questionValidationService = new QuestionValidationService();
