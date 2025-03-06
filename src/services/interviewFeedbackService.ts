
import { supabase } from "@/integrations/supabase/client";
import { 
  Question, 
  FeedbackResponse, 
  FeedbackRequest, 
  FeedbackMetrics 
} from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

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
    const request: FeedbackRequest = {
      industry,
      role,
      jobDescription,
      questions,
      userResponses,
      sessionId
    };

    try {
      await this.validateRequest(request);
      const metrics = this.calculatePreAnalysisMetrics(request);
      
      const { data, error } = await this.makeApiRequest(request, metrics);
      
      if (error) throw error;
      
      if (this.isValidFeedbackResponse(data)) {
        await this.saveFeedbackToDatabase(request.sessionId, data, request);
        
        // Return the detailed feedback text for backward compatibility
        return data.detailedFeedback || data.feedback || 
          "We couldn't generate detailed feedback at this time.";
      }
      
      // Legacy format support
      if (data?.feedback && typeof data.feedback === 'string') {
        await this.saveFeedbackToDatabase(request.sessionId, 
          { detailedFeedback: data.feedback } as FeedbackResponse, 
          request);
        return data.feedback;
      }
      
      throw new Error("Invalid feedback format received");
    } catch (error) {
      console.error("Error generating feedback:", error);
      const fallbackResponse = this.getFallbackFeedback(request);
      return fallbackResponse.detailedFeedback;
    } finally {
      this.retryCount = 0;
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

    return jobKeywords.length > 0 
      ? matchedKeywords.length / jobKeywords.length
      : 0.5; // Default value if no keywords are found
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
    return await supabase.functions.invoke('generate-interview-feedback', {
      body: {
        industry: request.industry,
        role: request.role,
        jobDescription: request.jobDescription,
        questions: request.questions.map(q => q.text),
        userResponses: request.userResponses,
        metrics,
        timestamp: new Date().toISOString(),
      }
    });
  }

  private isValidFeedbackResponse(data: any): data is FeedbackResponse {
    return (
      data && 
      (
        (data.feedback && typeof data.feedback === 'string') ||
        (data.detailedFeedback && typeof data.detailedFeedback === 'string')
      )
    );
  }

  private async saveFeedbackToDatabase(
    sessionId: string, 
    feedback: FeedbackResponse,
    request: FeedbackRequest
  ): Promise<void> {
    try {
      // First save the session
      const { error: sessionError } = await supabase
        .from('interview_sessions')
        .upsert({
          session_id: sessionId,
          user_id: supabase.auth.getUser()?.data?.user?.id,
          industry: request.industry,
          role: request.role,
          job_description: request.jobDescription,
          questions: request.questions,
          user_responses: request.userResponses,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });
        
      if (sessionError) throw sessionError;
      
      // Then save the feedback
      const { error: feedbackError } = await supabase
        .from('interview_feedback')
        .upsert({
          session_id: sessionId,
          user_id: supabase.auth.getUser()?.data?.user?.id,
          feedback,
          created_at: new Date().toISOString(),
        });
        
      if (feedbackError) throw feedbackError;
    } catch (error) {
      console.error('Error saving feedback:', error);
      // Don't throw - this is non-critical
    }
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
        used: this.extractKeywords(request.userResponses.join(' ')).slice(0, 10),
        missed: []
      }
    };
  }

  // Public utility methods
  async regenerateFeedback(sessionId: string): Promise<FeedbackResponse> {
    try {
      const { data: session, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error || !session) {
        throw new Error("Interview session not found");
      }

      const request: FeedbackRequest = {
        industry: session.industry,
        role: session.role,
        jobDescription: session.job_description,
        questions: session.questions,
        userResponses: session.user_responses,
        sessionId
      };

      const metrics = this.calculatePreAnalysisMetrics(request);
      const { data, error: feedbackError } = await this.makeApiRequest(request, metrics);
      
      if (feedbackError) throw feedbackError;
      
      if (this.isValidFeedbackResponse(data)) {
        await this.saveFeedbackToDatabase(sessionId, data, request);
        return data;
      }
      
      throw new Error("Invalid feedback format received");
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      throw error;
    }
  }

  async getFeedbackHistory(userId?: string): Promise<FeedbackResponse[]> {
    try {
      const user = userId || supabase.auth.getUser()?.data?.user?.id;
      
      if (!user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('feedback, created_at, session_id')
        .eq('user_id', user)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item.feedback,
        sessionId: item.session_id,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      return [];
    }
  }

  async getSessionById(sessionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  }
}

// Export singleton instance
export const interviewFeedbackService = InterviewFeedbackService.getInstance();
