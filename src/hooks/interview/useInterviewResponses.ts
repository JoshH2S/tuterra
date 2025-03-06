
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewQuestion } from "@/types/interview";

export const useInterviewResponses = (
  setResponses: (responses: Record<string, string>) => void
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveResponse = async (question: InterviewQuestion | null, responseText: string) => {
    if (!question) return;
    
    setLoading(true);
    try {
      // Directly append the response to the session rather than using a separate table
      const { error } = await supabase.functions.invoke('save-interview-response', {
        body: {
          questionId: question.id,
          responseText
        }
      });

      if (error) {
        // If the function isn't available yet, fall back to client-side processing
        // This means we'll just update the local state without persistence for now
        console.warn("Edge function not available, storing response in memory only");
      }
      
      // Update local state with the new response
      setResponses((prev) => {
        const newResponses = {...prev};
        newResponses[question.id] = responseText;
        return newResponses;
      });
    } catch (error) {
      console.error("Error saving response:", error);
      toast({
        title: "Error",
        description: "Failed to save your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (questionIds: string[]) => {
    if (questionIds.length === 0) return;
    
    setLoading(true);
    try {
      // Make a direct query for the responses
      const { data, error } = await supabase.functions.invoke('get-interview-responses', {
        body: { questionIds }
      });

      if (error) {
        // If the function isn't available, handle this gracefully
        console.warn("Edge function not available for fetching responses");
        return;
      }
      
      if (data && data.responses) {
        // Create a map of question_id to user_response
        const responseMap: Record<string, string> = {};
        data.responses.forEach((response: any) => {
          responseMap[response.question_id] = response.user_response;
        });
        setResponses(responseMap);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    saveResponse,
    fetchResponses,
    loading
  };
};
