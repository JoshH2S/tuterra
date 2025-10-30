import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewFeedback, InterviewTranscript } from "@/types/interview";

export const useInterviewFeedback = () => {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const generateFeedback = async (sessionId: string, transcript: InterviewTranscript[]) => {
    if (!sessionId || !transcript || transcript.length === 0) {
      toast({
        title: "Cannot Generate Feedback",
        description: "Missing session ID or transcript data.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setHasError(false);

    try {
      console.log("Generating feedback for session:", sessionId);
      
      // Call the edge function to generate feedback
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: {
          sessionId,
          transcript: transcript.map(item => ({
            question: item.question,
            answer: item.answer || "No answer provided"
          }))
        }
      });

      if (error) {
        console.error("Error generating feedback:", error);
        throw error;
      }

      if (data?.feedback) {
        setFeedback(data.feedback);
        toast({
          title: "Feedback Generated",
          description: "Your AI-powered interview feedback is ready!",
        });
      } else {
        throw new Error("No feedback data received");
      }
    } catch (error) {
      console.error("Failed to generate feedback:", error);
      setHasError(true);
      toast({
        title: "Feedback Generation Failed",
        description: "We couldn't generate your feedback right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchExistingFeedback = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      console.log("Fetching existing feedback for session:", sessionId);
      
      const { data, error } = await supabase.functions.invoke('get-interview-feedback', {
        body: { sessionId }
      });

      if (error) {
        console.error("Error fetching feedback:", error);
        return;
      }

      if (data?.feedback) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Failed to fetch existing feedback:", error);
    }
  };

  const retryGeneration = async (sessionId: string, transcript: InterviewTranscript[]) => {
    await generateFeedback(sessionId, transcript);
  };

  const resetFeedback = () => {
    setFeedback(null);
    setHasError(false);
    setIsGenerating(false);
  };

  return {
    feedback,
    isGenerating,
    hasError,
    generateFeedback,
    fetchExistingFeedback,
    retryGeneration,
    resetFeedback
  };
};