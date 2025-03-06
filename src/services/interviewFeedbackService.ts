
import { supabase } from "@/integrations/supabase/client";
import { Question, FeedbackResponse, FeedbackRequest } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

interface FeedbackMetrics {
  responseCompleteness: number;
  relevanceScore: number;
  technicalAccuracy?: number;
}

export class InterviewFeedbackService {
  private static instance: InterviewFeedbackService;
  private retryCount = 0;
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000; // ms

  private constructor() {}

  static getInstance(): InterviewFeedbackService {
    if (!InterviewFeedbackService.instance) {
      InterviewFeedbackService.instance = new InterviewFeedbackService();
    }
    return InterviewFeedbackService.instance;
  }

  async generateInterviewFeedback(
    industry: string,
    role: string,
    jobDescription: string,
    questions: Question[],
    userResponses: string[]
  ): Promise<string> {
    const sessionId = uuidv4();
    
    try {
      const request: FeedbackRequest = {
        industry,
        role,
        jobDescription,
        questions,
        userResponses,
        sessionId
      };
      
      await this.validateRequest(request);
      const metrics = this.calculatePreAnalysisMetrics(request);
      
      const { data, error } = await this.makeApiRequest(request, metrics);
      
      if (error) throw error;
      
      if (this.isValidFeedbackResponse(data)) {
        await this.saveFeedbackToDatabase(request.sessionId, data);
        return data.detailedFeedback || data.feedback || "Feedback generated successfully.";
      }
      
      throw new Error("Invalid feedback format received");
    } catch (error) {
      const fallbackResponse = await this.handleError(error, {
        industry,
        role,
        jobDescription,
        questions,
        userResponses,
        sessionId
      });
      return fallbackResponse.detailedFeedback;
    }
  }

  private async validateRequest(request: FeedbackRequest): Promise<void> {
    if (request.questions.length !== request.userResponses.length) {
      throw new Error("Question and response count mismatch");
    }

    if (!request.questions.length) {
      throw new Error("No questions provided");
    }

    // Validate response lengths
    const invalidResponses = request.userResponses.filter(
      response => !response || response.trim().length < 10
    );
    
    if (invalidResponses.length > 0) {
      throw new Error("One or more responses are too short or empty");
    }
  }

  private calculatePreAnalysisMetrics(request: FeedbackRequest): FeedbackMetrics {
    const responseCompleteness = request.userResponses.reduce(
      (acc, response, index) => {
        const expectedLength = 100; // base expected length
        const actualLength = response.trim().length;
        return acc + (Math.min(actualLength / expectedLength, 1.5) / request.userResponses.length);
      }, 
      0
    );

    const relevanceScore = this.calculateRelevanceScore(request);

    return {
      responseCompleteness,
      relevanceScore,
    };
  }

  private calculateRelevanceScore(request: FeedbackRequest): number {
    const jobKeywords = this.extractKeywords(request.jobDescription);
    const responseKeywords = request.userResponses.flatMap(
      response => this.extractKeywords(response)
    );

    const matchedKeywords = jobKeywords.filter(
      keyword => responseKeywords.includes(keyword)
    );

    return jobKeywords.length > 0 ? matchedKeywords.length / jobKeywords.length : 0;
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .match(/\b\w+\b/g)
      ?.filter(word => word.length > 3) || [];
  }

  private async makeApiRequest(
    request: FeedbackRequest, 
    metrics: FeedbackMetrics
  ) {
    const response = await supabase.functions.invoke('generate-interview-feedback', {
      body: {
        ...request,
        metrics,
        timestamp: new Date().toISOString(),
      }
    });
    
    return response;
  }

  private isValidFeedbackResponse(data: any): data is FeedbackResponse {
    return (
      (data?.feedback || data?.detailedFeedback) &&
      (typeof data.overallScore === 'number' || 
       typeof data.feedback === 'string' || 
       typeof data.detailedFeedback === 'string')
    );
  }

  private async saveFeedbackToDatabase(
    sessionId: string, 
    feedback: FeedbackResponse
  ): Promise<void> {
    try {
      const feedbackData = {
        session_id: sessionId,
        feedback: feedback as any,
        created_at: new Date().toISOString(),
      };
      
      await supabase
        .from('interview_feedback')
        .upsert(feedbackData);
        
    } catch (error) {
      console.error('Error saving feedback:', error);
      // Don't throw - this is non-critical
    }
  }

  private async handleError(error: any, request: FeedbackRequest): Promise<FeedbackResponse> {
    console.error("Error generating feedback:", error);

    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      const result = await this.generateInterviewFeedback(
        request.industry,
        request.role,
        request.jobDescription,
        request.questions,
        request.userResponses
      );
      return { detailedFeedback: result } as FeedbackResponse;
    }

    return this.getFallbackFeedback(request);
  }

  private getFallbackFeedback(request: FeedbackRequest): FeedbackResponse {
    const metrics = this.calculatePreAnalysisMetrics(request);
    
    return {
      overallScore: Math.round(metrics.responseCompleteness * 100),
      categoryScores: {
        completeness: Math.round(metrics.responseCompleteness * 100),
        relevance: Math.round(metrics.relevanceScore * 100),
      },
      strengths: ["Unable to analyze specific strengths at this time."],
      improvements: ["Please try regenerating the feedback for detailed improvements."],
      detailedFeedback: "We apologize, but we couldn't generate detailed feedback at this time. " +
        "However, based on our basic analysis, your responses were " +
        `${metrics.responseCompleteness > 0.7 ? "comprehensive" : "somewhat brief"} and ` +
        `${metrics.relevanceScore > 0.6 ? "relevant to the job requirements" : "could be more focused on job requirements"}.`,
      keywords: {
        used: this.extractKeywords(request.userResponses.join(' ')),
        missed: []
      }
    };
  }

  // Public utility methods
  async regenerateFeedback(sessionId: string): Promise<void> {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error("Interview session not found:", sessionError);
        throw new Error("Interview session not found");
      }

      // Convert the data to the right format and apply proper type casting
      const request: FeedbackRequest = {
        industry: sessionData.industry as string,
        role: sessionData.role as string,
        jobDescription: sessionData.job_description as string,
        questions: (sessionData.questions as any[]).map(q => ({
          ...q,
          id: q.id || uuidv4()
        })) as Question[],
        userResponses: (sessionData.user_responses as string[]),
        sessionId
      };

      const metrics = this.calculatePreAnalysisMetrics(request);
      const { data, error } = await this.makeApiRequest(request, metrics);

      if (error) throw error;

      if (this.isValidFeedbackResponse(data)) {
        await this.saveFeedbackToDatabase(sessionId, data);
      }
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      throw error;
    }
  }

  async getFeedbackHistory(): Promise<FeedbackResponse[]> {
    try {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Properly cast the feedback field from each row to FeedbackResponse
      return (data || []).map(item => {
        if (typeof item.feedback === 'string') {
          try {
            // If feedback is stored as a JSON string, parse it
            return JSON.parse(item.feedback);
          } catch (e) {
            // If parsing fails, return a minimal valid object
            return {
              detailedFeedback: item.feedback,
              overallScore: 0,
              categoryScores: {},
              strengths: [],
              improvements: [],
              keywords: { used: [], missed: [] }
            };
          }
        } else {
          // If feedback is already an object, return it
          return item.feedback as FeedbackResponse;
        }
      });
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      return [];
    }
  }
}

// Export singleton instance
export const interviewFeedbackService = InterviewFeedbackService.getInstance();
