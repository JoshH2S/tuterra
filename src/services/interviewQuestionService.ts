
import { supabase } from "@/integrations/supabase/client";
import { 
  Question, 
  FALLBACK_QUESTIONS, 
  QuestionCategory, 
  QuestionCategoryConfig, 
  InterviewConfig, 
  GenerateQuestionsResponse 
} from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

const DEFAULT_CONFIG = {
  numberOfQuestions: 5,
  timeLimit: 30,
  categories: [
    { id: '1', name: 'Technical' as QuestionCategory, weight: 40 },
    { id: '2', name: 'Behavioral' as QuestionCategory, weight: 30 },
    { id: '3', name: 'Problem Solving' as QuestionCategory, weight: 20 },
    { id: '4', name: 'Cultural Fit' as QuestionCategory, weight: 10 }
  ]
};

export class InterviewQuestionService {
  private static instance: InterviewQuestionService;
  private cachedQuestions: Map<string, Question[]> = new Map();
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  private constructor() {}

  static getInstance(): InterviewQuestionService {
    if (!InterviewQuestionService.instance) {
      InterviewQuestionService.instance = new InterviewQuestionService();
    }
    return InterviewQuestionService.instance;
  }

  async generateInterviewQuestions(config: InterviewConfig): Promise<GenerateQuestionsResponse> {
    const sessionId = uuidv4();
    const finalConfig = this.mergeWithDefaultConfig(config);

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(config);
      const cachedResult = this.cachedQuestions.get(cacheKey);
      if (cachedResult) {
        console.log('Using cached questions');
        return this.formatResponse(cachedResult);
      }

      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          ...finalConfig,
          sessionId
        }
      });

      if (error) throw error;

      if (this.isValidQuestionResponse(data)) {
        const formattedQuestions = this.formatQuestions(data.questions, finalConfig);
        this.cachedQuestions.set(cacheKey, formattedQuestions);
        return this.formatResponse(formattedQuestions);
      }

      throw new Error('Invalid question format received from API');
    } catch (error) {
      console.error(`Error generating questions (Attempt ${this.retryCount + 1}/${this.MAX_RETRIES}):`, error);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        return await this.generateInterviewQuestions(config);
      }

      return this.getFallbackQuestions(finalConfig);
    } finally {
      this.retryCount = 0;
    }
  }

  private mergeWithDefaultConfig(config: InterviewConfig): Required<InterviewConfig> {
    return {
      ...DEFAULT_CONFIG,
      ...config,
      categories: config.categories || DEFAULT_CONFIG.categories
    } as Required<InterviewConfig>;
  }

  private generateCacheKey(config: InterviewConfig): string {
    return `${config.industry}-${config.role}-${config.numberOfQuestions}`;
  }

  private isValidQuestionResponse(data: any): data is { questions: Partial<Question>[] } {
    return (
      data?.questions &&
      Array.isArray(data.questions) &&
      data.questions.length > 0 &&
      data.questions.every((q: any) => q.text && typeof q.text === 'string')
    );
  }

  private formatQuestions(questions: Partial<Question>[], config: Required<InterviewConfig>): Question[] {
    return questions.map((q, index) => ({
      id: uuidv4(),
      text: q.text!,
      category: q.category || this.assignCategory(index, config.categories),
      estimatedTimeSeconds: q.estimatedTimeSeconds || 120,
      difficulty: q.difficulty || 'medium',
      keywords: q.keywords || this.extractKeywords(q.text!),
      orderIndex: index
    }));
  }

  private assignCategory(index: number, categories: QuestionCategoryConfig[]): QuestionCategory {
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    const normalizedWeights = categories.map(cat => cat.weight / totalWeight);
    const position = (index / categories.length) % 1;
    
    let accumulator = 0;
    for (let i = 0; i < normalizedWeights.length; i++) {
      accumulator += normalizedWeights[i];
      if (position <= accumulator) {
        return categories[i].name;
      }
    }
    
    return categories[0].name;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const commonKeywords = ['react', 'javascript', 'python', 'leadership', 'experience', 'team'];
    return [...new Set(words.filter(word => commonKeywords.includes(word)))];
  }

  private formatResponse(questions: Question[]): GenerateQuestionsResponse {
    const categoryCount = questions.reduce((acc, q) => {
      if (q.category) {
        acc[q.category] = (acc[q.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<QuestionCategory, number>);

    return {
      questions,
      metadata: {
        totalTime: questions.reduce((sum, q) => sum + (q.estimatedTimeSeconds || 0), 0),
        categoryBreakdown: categoryCount
      }
    };
  }

  private getFallbackQuestions(config: Required<InterviewConfig>): GenerateQuestionsResponse {
    const fallbackQuestions: Question[] = FALLBACK_QUESTIONS.map((text, index) => ({
      id: uuidv4(),
      text,
      category: this.assignCategory(index, config.categories),
      estimatedTimeSeconds: 120,
      difficulty: 'medium',
      keywords: this.extractKeywords(text),
      orderIndex: index
    }));

    return this.formatResponse(fallbackQuestions);
  }

  // Utility method to validate questions before use
  validateQuestions(questions: Question[]): boolean {
    return questions.every(q => 
      q.id &&
      q.text &&
      (q.category === undefined || typeof q.category === 'string') &&
      (q.estimatedTimeSeconds === undefined || q.estimatedTimeSeconds > 0) &&
      (q.difficulty === undefined || ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'].includes(q.difficulty))
    );
  }
}

// Export a singleton instance
export const interviewQuestionService = InterviewQuestionService.getInstance();
