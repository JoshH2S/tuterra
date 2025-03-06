
import { 
  Question,
  InterviewConfig, 
  GenerateQuestionsResponse 
} from "@/types/interview";
import { questionGenerationService } from "./interview/questionGenerationService";
import { questionCacheService } from "./interview/questionCacheService";
import { fallbackQuestionService } from "./interview/fallbackQuestionService";
import { questionValidationService } from "./interview/questionValidationService";

export class InterviewQuestionService {
  private static instance: InterviewQuestionService;

  private constructor() {}

  static getInstance(): InterviewQuestionService {
    if (!InterviewQuestionService.instance) {
      InterviewQuestionService.instance = new InterviewQuestionService();
    }
    return InterviewQuestionService.instance;
  }

  async generateInterviewQuestions(config: InterviewConfig): Promise<GenerateQuestionsResponse> {
    try {
      // Check cache first
      const cachedQuestions = questionCacheService.getCachedQuestions(config);
      if (cachedQuestions) {
        return questionGenerationService.formatResponse(cachedQuestions);
      }

      // Generate new questions if no cache exists
      const result = await questionGenerationService.generateInterviewQuestions(config);
      
      // Cache the successful result
      questionCacheService.cacheQuestions(config, result.questions);
      
      return result;
    } catch (error) {
      console.error("Interview questions generation error:", error);
      
      // Attempt to use fallback questions if generation fails
      try {
        const finalConfig = this.getFinalConfig(config);
        const fallbackResult = fallbackQuestionService.getFallbackQuestions(finalConfig);
        
        if (fallbackResult && fallbackResult.questions.length > 0) {
          console.log(`Using ${fallbackResult.questions.length} fallback questions after failed generation`);
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error("Error generating fallback questions:", fallbackError);
      }
      
      // If even fallbacks fail, throw the original error
      throw error;
    }
  }

  validateQuestions(questions: Question[]): boolean {
    return questionValidationService.validateQuestions(questions);
  }
  
  private getFinalConfig(config: InterviewConfig): Required<InterviewConfig> {
    return {
      numberOfQuestions: config.numberOfQuestions || 5,
      timeLimit: config.timeLimit || 30,
      categories: config.categories || [
        { id: '1', name: 'Technical', weight: 40 },
        { id: '2', name: 'Behavioral', weight: 30 },
        { id: '3', name: 'Problem Solving', weight: 20 },
        { id: '4', name: 'Cultural Fit', weight: 10 }
      ],
      industry: config.industry || 'General',
      role: config.role || 'Professional',
      jobDescription: config.jobDescription || '',
      sessionId: config.sessionId || 'default-session'
    };
  }
}

// Export singleton instance
export const interviewQuestionService = InterviewQuestionService.getInstance();
