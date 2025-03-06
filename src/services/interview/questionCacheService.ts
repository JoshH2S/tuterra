
import { Question, InterviewConfig } from "@/types/interview";

export class QuestionCacheService {
  private cachedQuestions: Map<string, Question[]> = new Map();
  
  getCachedQuestions(config: InterviewConfig): Question[] | null {
    const cacheKey = this.generateCacheKey(config);
    const cachedResult = this.cachedQuestions.get(cacheKey);
    
    if (cachedResult) {
      console.log('Using cached questions');
      return cachedResult;
    }
    
    return null;
  }
  
  cacheQuestions(config: InterviewConfig, questions: Question[]): void {
    if (questions.length > 0) {
      const cacheKey = this.generateCacheKey(config);
      this.cachedQuestions.set(cacheKey, questions);
    }
  }
  
  generateCacheKey(config: InterviewConfig): string {
    return `${config.industry}-${config.role}-${config.numberOfQuestions}`;
  }
  
  clearCache(): void {
    this.cachedQuestions.clear();
  }
}

export const questionCacheService = new QuestionCacheService();
