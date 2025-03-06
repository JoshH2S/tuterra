
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
        // Process the feedback data carefully
        const feedbackData = data.feedback;
        
        // Create a properly typed feedback object with safe fallbacks
        const processedFeedback: InterviewFeedback = {
          id: feedbackData.id || '',
          session_id: feedbackData.session_id || '',
          feedback: typeof feedbackData.feedback === 'string' ? feedbackData.feedback : '',
          strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : [],
          areas_for_improvement: Array.isArray(feedbackData.areas_for_improvement) ? feedbackData.areas_for_improvement : [],
          overall_score: typeof feedbackData.overall_score === 'number' ? feedbackData.overall_score : 0,
          created_at: feedbackData.created_at || '',
          updated_at: feedbackData.updated_at || feedbackData.created_at || ''
        };
        
        setFeedback(processedFeedback);
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
      // Use functions.invoke instead of direct query since the table might not be in the types
      const { data, error } = await supabase.functions.invoke('get-interview-feedback', {
        body: { sessionId }
      });

      if (error) throw error;
      
      if (data && data.feedback) {
        const feedbackData = data.feedback;
        
        // Construct a properly typed feedback object with safe defaults
        const processedFeedback: InterviewFeedback = {
          id: feedbackData.id || '',
          session_id: feedbackData.session_id || '',
          feedback: typeof feedbackData.feedback === 'string' ? feedbackData.feedback : '',
          strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : [],
          areas_for_improvement: Array.isArray(feedbackData.areas_for_improvement) ? feedbackData.areas_for_improvement : [],
          overall_score: typeof feedbackData.overall_score === 'number' ? feedbackData.overall_score : 0,
          created_at: feedbackData.created_at || '',
          updated_at: feedbackData.updated_at || feedbackData.created_at || ''
        };
        
        setFeedback(processedFeedback);
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
