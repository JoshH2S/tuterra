
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { 
  Question,
  QuestionCategory,
  QuestionCategoryConfig, 
  InterviewConfig, 
  GenerateQuestionsResponse 
} from "@/types/interview";

export class QuestionGenerationService {
  private retryCount = 0;
  private readonly MAX_RETRIES = 2;

  async generateInterviewQuestions(config: InterviewConfig): Promise<GenerateQuestionsResponse> {
    const sessionId = uuidv4();
    const finalConfig = this.mergeWithDefaultConfig(config);

    try {
      console.log("Calling supabase function with config:", JSON.stringify({
        industry: finalConfig.industry,
        role: finalConfig.role,
        hasJobDescription: !!finalConfig.jobDescription,
        numQuestions: finalConfig.numberOfQuestions
      }));

      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          ...finalConfig,
          sessionId
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      console.log("Received response:", JSON.stringify({
        hasData: !!data,
        questionCount: data?.questions?.length || 0,
        responseData: data
      }));

      if (this.isValidQuestionResponse(data)) {
        const formattedQuestions = this.formatQuestions(data.questions, finalConfig);
        
        if (formattedQuestions.length === 0) {
          throw new Error("No valid questions were returned after formatting");
        }
        
        return this.formatResponse(formattedQuestions);
      }

      console.error("Invalid question format received from API:", data);
      throw new Error('Invalid question format received from API');
    } catch (error) {
      console.error(`Error generating questions (Attempt ${this.retryCount + 1}/${this.MAX_RETRIES}):`, error);
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        return await this.generateInterviewQuestions(config);
      }

      this.retryCount = 0;
      throw error;
    }
  }

  private mergeWithDefaultConfig(config: InterviewConfig): Required<InterviewConfig> {
    return {
      numberOfQuestions: 5,
      timeLimit: 30,
      categories: config.categories || [
        { id: '1', name: 'Technical' as QuestionCategory, weight: 40 },
        { id: '2', name: 'Behavioral' as QuestionCategory, weight: 30 },
        { id: '3', name: 'Problem Solving' as QuestionCategory, weight: 20 },
        { id: '4', name: 'Cultural Fit' as QuestionCategory, weight: 10 }
      ],
      industry: config.industry || 'General',
      role: config.role || 'Professional',
      jobDescription: config.jobDescription || '',
      sessionId: config.sessionId || 'default-session'
    } as Required<InterviewConfig>;
  }

  private isValidQuestionResponse(data: any): data is { questions: Partial<Question>[] } {
    if (!data) {
      console.log("Response data is null or undefined");
      return false;
    }
    
    if (!data.questions) {
      console.log("Response has no questions property:", data);
      return false;
    }
    
    if (!Array.isArray(data.questions)) {
      console.log("Questions is not an array:", typeof data.questions);
      return false;
    }
    
    if (data.questions.length === 0) {
      console.log("Questions array is empty");
      return false;
    }
    
    const allValid = data.questions.every((q: any) => q && q.text && typeof q.text === 'string');
    if (!allValid) {
      console.log("Some questions are invalid:", data.questions.filter((q: any) => !q || !q.text).slice(0, 2));
    }
    
    return allValid;
  }

  formatQuestions(questions: Partial<Question>[], config: Required<InterviewConfig>): Question[] {
    return questions.map((q, index) => ({
      id: q.id || uuidv4(),
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
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const commonKeywords = ['react', 'javascript', 'python', 'leadership', 'experience', 'team'];
    return [...new Set(words.filter(word => commonKeywords.includes(word)))];
  }

  formatResponse(questions: Question[]): GenerateQuestionsResponse {
    if (!questions || questions.length === 0) {
      console.error("No questions available to format into response");
      throw new Error("No questions available to format into response");
    }

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
}

export const questionGenerationService = new QuestionGenerationService();
