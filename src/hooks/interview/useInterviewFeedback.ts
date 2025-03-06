
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewFeedback, InterviewQuestion, InterviewTranscript } from "@/types/interview";

export const useInterviewFeedback = (
  sessionId: string | null
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const generateFeedback = async (transcript: InterviewTranscript[]) => {
    if (!sessionId || transcript.length === 0) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: { sessionId, transcript }
      });

      if (error) throw error;
      
      if (data && data.feedback) {
        setFeedback(data.feedback);
        toast({
          title: "Feedback generated",
          description: "Your interview feedback is ready!",
        });
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      if (data) {
        setFeedback(data);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFeedback,
    fetchFeedback,
    feedback,
    loading
  };
};
