
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

  const generateQuestions = async (industry: string, jobRole: string, jobDescription: string, sessionId: string) => {
    // Input validation
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      console.error("Cannot generate questions: No valid session ID provided", { sessionId });
      throw new Error("Session ID is missing or invalid");
    }
    
    setLoading(true);
    console.log(`Generating questions for session [${sessionId}] with:`, { 
      industry, 
      jobRole, 
      jobDescription: jobDescription?.substring(0, 50) + '...' 
    });
    
    try {
      // Call the edge function with detailed logging
      console.log("Calling generate-interview-questions edge function...");
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          industry, 
          jobRole, 
          jobDescription, 
          sessionId 
        },
        options: {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });

      console.log("Edge function response:", data, error);

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("No data returned from the server");
      }
      
      if (data?.questions && Array.isArray(data.questions)) {
        console.log(`Received ${data.questions.length} questions from edge function`);
        
        // Validate the shape of the received questions
        const formattedQuestions = data.questions.map((q: any) => ({
          id: q.id || `q-${crypto.randomUUID()}`,
          session_id: sessionId,
          question: q.question || '',
          question_order: q.question_order || 0,
          created_at: q.created_at || new Date().toISOString()
        }));
        
        setQuestions(formattedQuestions);
        toast({
          title: "Questions generated",
          description: "Your interview questions are ready. Let's start the interview!",
        });
        
        return formattedQuestions;
      } else {
        console.error("Questions array missing or invalid in response:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error; // Let the calling code handle this and use fallback questions
    } finally {
      setLoading(false);
    }
  };

  // Generate client-side fallback questions that can be called directly
  const generateFallbackQuestions = (jobRole: string, industry: string): InterviewQuestion[] => {
    const currentDate = new Date().toISOString();
    const baseQuestions = [
      {
        id: `fallback-1`,
        session_id: sessionId || '',
        question: `Tell me about your experience as a ${jobRole}.`,
        question_order: 0,
        created_at: currentDate
      },
      {
        id: `fallback-2`,
        session_id: sessionId || '',
        question: `What interests you about working in ${industry}?`,
        question_order: 1,
        created_at: currentDate
      },
      {
        id: `fallback-3`,
        session_id: sessionId || '',
        question: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
        question_order: 2,
        created_at: currentDate
      },
      {
        id: `fallback-4`,
        session_id: sessionId || '',
        question: `What specific skills do you have that make you qualified for this ${jobRole} position?`,
        question_order: 3,
        created_at: currentDate
      },
      {
        id: `fallback-5`,
        session_id: sessionId || '',
        question: `Where do you see yourself professionally in five years?`,
        question_order: 4,
        created_at: currentDate
      }
    ];
  
    // Add industry-specific questions
    if (industry.toLowerCase().includes('tech') || 
        industry.toLowerCase().includes('technology')) {
      baseQuestions.push({
        id: `fallback-6`,
        session_id: sessionId || '',
        question: "Describe a technical project you worked on that you're particularly proud of.",
        question_order: 5,
        created_at: currentDate
      });
    } else if (industry.toLowerCase().includes('finance')) {
      baseQuestions.push({
        id: `fallback-6`,
        session_id: sessionId || '',
        question: "How do you ensure accuracy and attention to detail in your financial work?",
        question_order: 5,
        created_at: currentDate
      });
    } else if (industry.toLowerCase().includes('health')) {
      baseQuestions.push({
        id: `fallback-6`,
        session_id: sessionId || '',
        question: "How do you balance patient care with administrative responsibilities?",
        question_order: 5,
        created_at: currentDate
      });
    }
    
    // Add role-specific questions
    if (jobRole.toLowerCase().includes('manager') || 
        jobRole.toLowerCase().includes('leader')) {
      baseQuestions.push({
        id: `fallback-7`,
        session_id: sessionId || '',
        question: "Describe your management style and how you motivate your team.",
        question_order: 6,
        created_at: currentDate
      });
    } else if (jobRole.toLowerCase().includes('engineer') || 
               jobRole.toLowerCase().includes('developer')) {
      baseQuestions.push({
        id: `fallback-7`,
        session_id: sessionId || '',
        question: "How do you approach debugging and troubleshooting complex technical issues?",
        question_order: 6,
        created_at: currentDate
      });
    } else if (jobRole.toLowerCase().includes('analyst')) {
      baseQuestions.push({
        id: `fallback-7`,
        session_id: sessionId || '',
        question: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
        question_order: 6,
        created_at: currentDate
      });
    }
    
    return baseQuestions;
  };

  const fetchQuestions = async () => {
    if (!sessionId) {
      console.error("Cannot fetch questions: No session ID provided");
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching questions for session ${sessionId}`);
      
      // First try to get questions from interview_sessions table directly
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('questions')
        .eq('session_id', sessionId)
        .single();
      
      if (sessionError) {
        console.error("Error fetching questions from session data:", sessionError);
        throw sessionError;
      }
      
      if (sessionData?.questions && Array.isArray(sessionData.questions) && sessionData.questions.length > 0) {
        console.log(`Retrieved ${sessionData.questions.length} questions from session data`);
        
        // Format the questions from the session data
        const formattedQuestions: InterviewQuestion[] = sessionData.questions.map((q: any, index: number) => ({
          id: q.id || `session-q-${index}`,
          session_id: sessionId,
          question: q.question || q.text || '', // Handle different question formats
          question_order: q.question_order !== undefined ? q.question_order : index,
          created_at: q.created_at || new Date().toISOString()
        }));
        
        setQuestions(formattedQuestions);
      } else {
        console.log("No questions found or empty questions array in session data");
        throw new Error("No questions found in session data");
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
    generateFallbackQuestions,
    fetchQuestions,
    loading
  };
};
