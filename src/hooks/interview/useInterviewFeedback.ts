
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewFeedback, InterviewTranscript } from "@/types/interview";

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
        // Ensure the feedback data matches our InterviewFeedback interface
        const feedbackData: InterviewFeedback = {
          id: data.feedback.id,
          session_id: data.feedback.session_id,
          feedback: data.feedback.feedback,
          strengths: data.feedback.strengths || [],
          areas_for_improvement: data.feedback.areas_for_improvement || [],
          overall_score: data.feedback.overall_score || 0,
          created_at: data.feedback.created_at,
          updated_at: data.feedback.updated_at
        };
        
        setFeedback(feedbackData);
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
        // Map the data to our InterviewFeedback interface
        const feedbackData: InterviewFeedback = {
          id: data.id,
          session_id: data.session_id,
          feedback: data.feedback.feedback || data.feedback,
          strengths: data.feedback.strengths || [],
          areas_for_improvement: data.feedback.areas_for_improvement || [],
          overall_score: data.feedback.overall_score || 0,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setFeedback(feedbackData);
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
