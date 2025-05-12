
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";
import { useAuth } from "@/hooks/useAuth";

export interface InternshipFeedback {
  feedback: string;
  progressId: string;
}

export const useInternshipProgress = (sessionId: string | null) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  
  const generateFeedback = async (
    transcript: InterviewTranscript[], 
    jobTitle: string, 
    industry: string
  ) => {
    if (!user || !sessionId || transcript.length === 0) {
      console.error("Missing required data for feedback generation");
      return null;
    }
    
    setLoading(true);
    
    try {
      // Add user ID to the request headers for the edge function
      const requestHeaders = new Headers();
      requestHeaders.append('x-userid', user.id);
      
      const { data, error } = await supabase.functions.invoke('generate-internship-feedback', {
        headers: requestHeaders,
        body: { 
          sessionId, 
          transcript,
          jobTitle,
          industry
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.feedback) {
        setFeedback(data.feedback);
        setProgressId(data.progressId);
        
        toast({
          title: "Feedback Generated",
          description: "Your interview feedback is ready!",
        });
        
        return data as InternshipFeedback;
      }
      
      return null;
    } catch (error) {
      console.error("Error generating internship feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const continueToPhase2 = async () => {
    if (!user || !sessionId) {
      console.error("Missing user or session ID");
      return false;
    }
    
    setLoading(true);
    
    try {
      // Get existing session data
      const { data: sessionData, error: fetchError } = await supabase
        .from('interview_sessions')
        .select('job_title, industry, job_description')
        .eq('session_id', sessionId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Check if internship session exists for this user and session
      const { data: existingSession, error: checkError } = await supabase
        .from('internship_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingSession) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('internship_sessions')
          .update({
            current_phase: 2
          })
          .eq('id', existingSession.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new internship session
        const { error: insertError } = await supabase
          .from('internship_sessions')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            job_title: sessionData.job_title,
            industry: sessionData.industry,
            job_description: sessionData.job_description,
            current_phase: 2
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      toast({
        title: "Phase 2 Unlocked",
        description: "You're now ready to begin the onboarding phase!",
      });
      
      // Navigate to Phase 2
      navigate(`/internship/phase-2?session=${sessionId}`);
      return true;
    } catch (error) {
      console.error("Error progressing to Phase 2:", error);
      toast({
        title: "Error",
        description: "Failed to progress to Phase 2. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    generateFeedback,
    continueToPhase2,
    feedback,
    progressId,
    loading
  };
};
