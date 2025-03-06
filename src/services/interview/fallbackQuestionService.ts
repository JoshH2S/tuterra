
import { v4 as uuidv4 } from "@/lib/uuid";
import { 
  InterviewConfig, 
  Question, 
  QuestionCategory, 
  GenerateQuestionsResponse, 
  FALLBACK_QUESTIONS 
} from "@/types/interview";

export class FallbackQuestionService {
  getFallbackQuestions(config: Required<InterviewConfig>): GenerateQuestionsResponse {
    console.log("Creating fallback questions for", config.role);
    
    // Create role-specific questions when possible
    let fallbackTexts = [...FALLBACK_QUESTIONS];
    
    // Add some role-specific questions
    if (config.role) {
      fallbackTexts = [
        `Tell me about your experience with ${config.role} roles.`,
        `What skills do you think are most important for a ${config.role} position?`,
        `Describe a challenging situation you faced in a previous ${config.role} role.`,
        ...fallbackTexts
      ];
    }
    
    // If we have industry info, add that too
    if (config.industry) {
      fallbackTexts.unshift(`Why are you interested in the ${config.industry} industry?`);
    }
    
    const fallbackQuestions: Question[] = fallbackTexts.slice(0, config.numberOfQuestions).map((text, index) => ({
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
  
  private assignCategory(index: number, categories: any[]): QuestionCategory {
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
  
  private formatResponse(questions: Question[]): GenerateQuestionsResponse {
    if (!questions || questions.length === 0) {
      console.error("No fallback questions available");
      throw new Error("No fallback questions available");
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

export const fallbackQuestionService = new FallbackQuestionService();
