
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
      // Use the edge function to save the response
      const { error } = await supabase.functions.invoke('save-interview-response', {
        body: {
          questionId: question.id,
          responseText
        }
      });

      if (error) {
        console.warn("Edge function error:", error);
        // We'll still update local state even if there's an error with the edge function
      }
      
      // Update local state with the new response
      // Create a copy of responses and update it directly
      // Since setResponses expects a Record<string, string>, we need to update it this way
      const updatedResponses: Record<string, string> = {};
      updatedResponses[question.id] = responseText;
      
      // The parent component is responsible for merging with previous responses
      setResponses(updatedResponses);
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
      // Use the edge function to fetch responses
      const { data, error } = await supabase.functions.invoke('get-interview-responses', {
        body: { questionIds }
      });

      if (error) {
        console.warn("Edge function error:", error);
        return;
      }
      
      if (data && Array.isArray(data.responses)) {
        // Create a map of question_id to user_response
        const responseMap: Record<string, string> = {};
        data.responses.forEach((response: any) => {
          if (response.question_id && response.user_response) {
            responseMap[response.question_id] = response.user_response;
          }
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
