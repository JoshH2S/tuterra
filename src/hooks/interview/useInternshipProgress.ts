
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface InternshipFeedbackResult {
  feedback: string;
  session_id: string;
  user_responses: InterviewTranscript[];
}

export const useInternshipProgress = (sessionId: string | null) => {
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate feedback using OpenAI
  const generateInternshipFeedback = async (
    transcript: InterviewTranscript[],
    jobTitle: string,
    industry: string
  ): Promise<string> => {
    if (!sessionId || !user) {
      throw new Error("Missing session ID or user");
    }

    setIsGeneratingFeedback(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-internship-feedback', {
        body: {
          sessionId,
          transcript,
          jobTitle,
          industry
        }
      });

      if (error) throw error;
      
      if (data?.feedback) {
        setFeedback(data.feedback);
        return data.feedback;
      } else {
        throw new Error("No feedback received from API");
      }
    } catch (err) {
      console.error("Error generating feedback:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate feedback";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Could not generate internship feedback. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Save progress to the database
  const saveInternshipProgress = async (
    transcript: InterviewTranscript[],
    feedbackText: string
  ): Promise<void> => {
    if (!sessionId || !user) {
      toast({
        title: "Error",
        description: "Missing session ID or user authentication",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert into internship_progress table
      const { error } = await supabase
        .from('internship_progress')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          phase_number: 1,
          user_responses: transcript,
          ai_feedback: feedbackText,
        });

      if (error) throw error;

      toast({
        title: "Progress Saved",
        description: "Your internship progress has been recorded",
      });
    } catch (err) {
      console.error("Error saving internship progress:", err);
      toast({
        title: "Error",
        description: "Failed to save internship progress",
        variant: "destructive",
      });
    }
  };

  // Update phase and proceed to the next phase
  const proceedToNextPhase = async (): Promise<void> => {
    if (!sessionId || !user) {
      toast({
        title: "Error",
        description: "Missing session ID or user authentication",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the job title and industry from the interview session
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('job_title, industry, job_description')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Session not found");

      // Update or insert into internship_sessions
      const { data, error } = await supabase
        .from('internship_sessions')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          job_title: sessionData.job_title,
          industry: sessionData.industry,
          job_description: sessionData.job_description || "",
          current_phase: 2
        })
        .select();

      if (error) throw error;

      toast({
        title: "Phase Complete",
        description: "Moving to Phase 2: Onboarding",
      });
      
      // Navigate to phase 2
      navigate(`/internship/phase-2?sid=${sessionId}`);
    } catch (err) {
      console.error("Error proceeding to next phase:", err);
      toast({
        title: "Error",
        description: "Failed to proceed to the next phase",
        variant: "destructive",
      });
    }
  };

  return {
    isGeneratingFeedback,
    feedback,
    error,
    generateInternshipFeedback,
    saveInternshipProgress,
    proceedToNextPhase,
  };
};
