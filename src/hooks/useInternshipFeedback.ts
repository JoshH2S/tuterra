
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";

interface InternshipFeedback {
  feedback: string;
  internshipSessionId: string;
  progressId: string;
}

export const useInternshipFeedback = (sessionId: string | null) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasGeneratedFeedback, setHasGeneratedFeedback] = useState(false);
  const [internshipSessionId, setInternshipSessionId] = useState<string | null>(null);

  const generateFeedback = async (transcript: InterviewTranscript[]) => {
    if (!sessionId || transcript.length === 0) {
      toast({
        title: "Cannot generate feedback",
        description: "Missing interview session or transcript data.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: { sessionId, transcript }
      });

      if (error) {
        console.error("Error generating interview feedback:", error);
        throw error;
      }
      
      if (data?.feedback) {
        setFeedback(data.feedback);
        setInternshipSessionId(data.internshipSessionId);
        setHasGeneratedFeedback(true);
        
        toast({
          title: "Feedback Generated",
          description: "Your interview feedback is ready!",
        });
      }
      
      return data as InternshipFeedback;
    } catch (error: any) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingFeedback = async () => {
    if (!sessionId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('internship_progress')
        .select('ai_feedback')
        .eq('session_id', sessionId)
        .eq('phase_number', 1)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.ai_feedback) {
        setFeedback(data.ai_feedback);
        setHasGeneratedFeedback(true);
        return data.ai_feedback;
      }
      return null;
    } catch (error) {
      console.error("Error fetching existing feedback:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFeedback,
    fetchExistingFeedback,
    feedback,
    hasGeneratedFeedback,
    loading,
    internshipSessionId
  };
};
