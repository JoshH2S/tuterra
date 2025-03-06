
import { useState, useCallback, useRef } from "react";
import { FeedbackResponse, Question } from "@/types/interview";
import { interviewFeedbackService } from "@/services/interviewFeedbackService";
import { useToast } from "@/hooks/use-toast";

interface FeedbackRequestParams {
  sessionId: string;
  industry: string;
  role: string;
  jobDescription: string;
  questions: Question[];
  userResponses: string[];
}

export const useInterviewFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const { toast } = useToast();
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const generateFeedback = useCallback(async (params: FeedbackRequestParams) => {
    setIsGeneratingFeedback(true);
    retryCount.current = 0;

    const attemptGeneration = async (): Promise<void> => {
      try {
        const feedbackResponse = await interviewFeedbackService.generateInterviewFeedback(
          params.industry,
          params.role,
          params.jobDescription,
          params.questions,
          params.userResponses
        );

        setFeedback(feedbackResponse as FeedbackResponse);
      } catch (error) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
          return attemptGeneration();
        }
        throw error;
      }
    };

    try {
      await attemptGeneration();
    } catch (error) {
      console.error("Feedback generation error:", error);
      toast({
        title: "Feedback Error",
        description: "Failed to generate feedback. Please try regenerating.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, [toast]);

  const regenerateFeedback = useCallback(async (sessionId: string) => {
    setIsGeneratingFeedback(true);
    
    try {
      await interviewFeedbackService.regenerateFeedback(sessionId);
      
      // Fetch the updated feedback
      const feedbackHistory = await interviewFeedbackService.getFeedbackHistory();
      if (feedbackHistory && feedbackHistory.length > 0) {
        const latestFeedback = feedbackHistory[0];
        setFeedback(latestFeedback);
        
        toast({
          title: "Success",
          description: "Interview feedback has been regenerated.",
        });
      }
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, [toast]);

  const getInterviewHistory = useCallback(async () => {
    try {
      return await interviewFeedbackService.getFeedbackHistory();
    } catch (error) {
      console.error("Error fetching interview history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview history.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    feedback,
    isGeneratingFeedback,
    generateFeedback,
    regenerateFeedback,
    getInterviewHistory
  };
};
