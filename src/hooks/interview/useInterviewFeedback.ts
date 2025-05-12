
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";

export const useInterviewFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateFeedback = async (
    sessionId: string,
    jobTitle: string,
    industry: string,
    transcript: InterviewTranscript[]
  ) => {
    if (!sessionId || !transcript || transcript.length === 0) {
      setFeedbackError("Missing required information to generate feedback");
      return null;
    }

    setLoading(true);
    setFeedbackError(null);
    
    try {
      // Format transcript into Q&A pairs
      const formattedResponses = transcript.map(item => ({
        question: item.question,
        response: item.answer
      }));
      
      // Call the edge function to generate feedback
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: {
          sessionId,
          jobTitle,
          industry,
          responses: formattedResponses
        }
      });

      if (error) {
        console.error("Error generating feedback:", error);
        throw new Error(error.message || "Failed to generate feedback");
      }

      if (!data || !data.feedback) {
        throw new Error("Received invalid response from feedback service");
      }

      setFeedback(data.feedback);
      return data.feedback;
    } catch (error) {
      console.error("Error in generateFeedback:", error);
      setFeedbackError(error instanceof Error ? error.message : "An unexpected error occurred");
      
      toast({
        variant: "destructive",
        title: "Feedback Generation Failed",
        description: "We couldn't generate feedback for your interview. Please try again later."
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const progressToPhase2 = async (sessionId: string) => {
    setLoading(true);
    
    try {
      // Update the session to progress to phase 2
      const { error } = await supabase
        .from('internship_sessions')
        .update({ current_phase: 2 })
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Failed to progress to Phase 2: ${error.message}`);
      }

      // Navigate to Phase 2
      navigate(`/internship/phase-2/${sessionId}`);
    } catch (error) {
      console.error("Error progressing to Phase 2:", error);
      
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "We couldn't proceed to the next phase. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFeedback,
    progressToPhase2,
    feedback,
    feedbackError,
    loading
  };
};
