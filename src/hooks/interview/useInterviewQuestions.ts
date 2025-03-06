
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewQuestion } from "@/types/interview";

export const useInterviewQuestions = (
  sessionId: string | null,
  setQuestions: (questions: InterviewQuestion[]) => void
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateQuestions = async (industry: string, jobRole: string, jobDescription: string) => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { industry, jobRole, jobDescription, sessionId }
      });

      if (error) throw error;
      
      if (data && data.questions) {
        setQuestions(data.questions);
        toast({
          title: "Questions generated",
          description: "Your interview questions are ready. Let's start the interview!",
        });
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      // Use the edge function to fetch questions instead of direct query
      const { data, error } = await supabase.functions.invoke('get-interview-questions', {
        body: { sessionId }
      });

      if (error) throw error;
      
      // Process the returned data
      if (data && Array.isArray(data.questions)) {
        const questions: InterviewQuestion[] = data.questions.map((item: any) => ({
          id: item.id || '',
          session_id: item.session_id || '',
          question: item.question || '',
          question_order: typeof item.question_order === 'number' ? item.question_order : 0,
          created_at: item.created_at || ''
        }));
        
        setQuestions(questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuestions,
    fetchQuestions,
    loading
  };
};
