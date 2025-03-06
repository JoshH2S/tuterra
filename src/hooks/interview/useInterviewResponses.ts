
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
      const { error } = await supabase
        .from('interview_responses')
        .insert({
          question_id: question.id,
          user_response: responseText
        });

      if (error) throw error;
      
      // Update local state
      setResponses(prev => ({
        ...prev,
        [question.id]: responseText
      }));
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
      const { data, error } = await supabase
        .from('interview_responses')
        .select('*')
        .in('question_id', questionIds);

      if (error) throw error;
      
      if (data) {
        const responseMap: Record<string, string> = {};
        data.forEach(response => {
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
