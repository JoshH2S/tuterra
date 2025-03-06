
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
        // Parse the feedback data if needed
        const feedbackData = typeof data.feedback.feedback === 'string' && data.feedback.feedback.startsWith('{') 
          ? JSON.parse(data.feedback.feedback) 
          : data.feedback.feedback;
          
        // Ensure the feedback data matches our InterviewFeedback interface
        const processedFeedback: InterviewFeedback = {
          id: data.feedback.id,
          session_id: data.feedback.session_id,
          feedback: typeof feedbackData === 'object' ? feedbackData.feedback : data.feedback.feedback,
          strengths: Array.isArray(data.feedback.strengths) ? data.feedback.strengths : [],
          areas_for_improvement: Array.isArray(data.feedback.areas_for_improvement) ? data.feedback.areas_for_improvement : [],
          overall_score: typeof data.feedback.overall_score === 'number' ? data.feedback.overall_score : 0,
          created_at: data.feedback.created_at,
          updated_at: data.feedback.updated_at || data.feedback.created_at
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
      // Use custom query to avoid TypeScript errors with the table that's not in the types
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      
      if (data) {
        // Extract feedback data safely
        const feedbackObj = data.feedback || {};
        
        // Construct a properly typed feedback object
        const feedbackData: InterviewFeedback = {
          id: data.id,
          session_id: data.session_id,
          feedback: typeof feedbackObj === 'object' && feedbackObj.feedback ? feedbackObj.feedback : String(feedbackObj),
          strengths: Array.isArray(feedbackObj.strengths) ? feedbackObj.strengths : [],
          areas_for_improvement: Array.isArray(feedbackObj.areas_for_improvement) ? feedbackObj.areas_for_improvement : [],
          overall_score: typeof feedbackObj.overall_score === 'number' ? feedbackObj.overall_score : 0,
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
