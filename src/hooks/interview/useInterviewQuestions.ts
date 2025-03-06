
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
      // Use a direct query approach with explicit type handling
      const { data, error } = await supabase
        .rpc('get_interview_questions', { session_id_param: sessionId })
        .select('id, session_id, question, question_order, created_at');

      // Fallback to direct query if RPC is not available
      if (error && error.message.includes('function "get_interview_questions" does not exist')) {
        const directQuery = await supabase
          .from('interview_questions')
          .select('id, session_id, question, question_order, created_at')
          .eq('session_id', sessionId)
          .order('question_order', { ascending: true });
          
        if (directQuery.error) throw directQuery.error;
        
        if (directQuery.data) {
          // Map the data to ensure it matches our InterviewQuestion interface
          const questions: InterviewQuestion[] = directQuery.data.map(item => ({
            id: item.id,
            session_id: item.session_id,
            question: item.question,
            question_order: item.question_order,
            created_at: item.created_at
          }));
          
          setQuestions(questions);
        }
      } else if (data) {
        // If the RPC call succeeded, map the data
        const questions: InterviewQuestion[] = data.map(item => ({
          id: item.id,
          session_id: item.session_id,
          question: item.question,
          question_order: item.question_order,
          created_at: item.created_at
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
