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
    
    if (!industry || typeof industry !== 'string') {
      console.error("Cannot generate questions: Invalid industry parameter", { industry });
      throw new Error("Industry parameter is missing or invalid");
    }
    
    if (!jobRole || typeof jobRole !== 'string') {
      console.error("Cannot generate questions: Invalid jobRole parameter", { jobRole });
      throw new Error("Job role parameter is missing or invalid");
    }
    
    setLoading(true);
    console.log(`Generating questions for session [${sessionId}] with:`, { 
      industry, 
      jobRole, 
      jobDescription: jobDescription?.substring(0, 50) + '...' 
    });
    
    try {
      // Create the request payload
      const payload = { 
        industry, 
        jobRole, // Now correctly matched with the edge function
        jobDescription, 
        sessionId 
      };
      
      console.log("Calling generate-interview-questions edge function with payload:", payload);
      
      // Call the edge function with detailed logging
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
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
        
        // Process the questions from edge function's format to our application format
        const formattedQuestions = data.questions.map((q: any) => ({
          id: q.id || `q-${crypto.randomUUID()}`,
          session_id: sessionId,
          question: q.text || '', // Map text field to question field
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
      
      // First try to get questions from the interview_questions table
      const { data, error } = await supabase
        .from('interview_questions')
        .select('id, session_id, question, question_order, created_at')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (error) {
        console.error("Error fetching questions from interview_questions table:", error);
        
        // If there's an error with the direct query, try to get questions from the 
        // interview_sessions table's questions JSON field as fallback
        const sessionQuery = await supabase
          .from('interview_sessions')
          .select('questions')
          .eq('session_id', sessionId)
          .single();
        
        if (sessionQuery.error) {
          console.error("Error fetching questions from interview_sessions:", sessionQuery.error);
          throw new Error("Failed to retrieve questions from any source");
        }
        
        if (sessionQuery.data && Array.isArray(sessionQuery.data.questions) && sessionQuery.data.questions.length > 0) {
          console.log(`Retrieved ${sessionQuery.data.questions.length} questions from interview_sessions.questions`);
          
          // Format the questions from the session data
          const formattedQuestions: InterviewQuestion[] = sessionQuery.data.questions.map((q: any, index: number) => ({
            id: q.id || `session-q-${index}`,
            session_id: sessionId,
            question: q.question || q.text || '', // Handle different question formats
            question_order: q.question_order !== undefined ? q.question_order : index,
            created_at: q.created_at || new Date().toISOString()
          }));
          
          setQuestions(formattedQuestions);
          return;
        } else {
          console.error("No questions found in session data");
          throw new Error("No questions found in database");
        }
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`Retrieved ${data.length} questions from interview_questions table`);
        
        // Format the questions from the query result
        const formattedQuestions: InterviewQuestion[] = data.map((q) => ({
          id: q.id,
          session_id: q.session_id,
          question: q.question,
          question_order: q.question_order,
          created_at: q.created_at
        }));
        
        setQuestions(formattedQuestions);
      } else {
        console.log("No questions found in interview_questions table");
        
        // As a fallback, try to get questions from the session's questions field
        const sessionQuery = await supabase
          .from('interview_sessions')
          .select('questions')
          .eq('session_id', sessionId)
          .single();
        
        if (sessionQuery.error) {
          console.error("Error fetching session:", sessionQuery.error);
          throw new Error("No questions found in database");
        }
        
        if (sessionQuery.data && Array.isArray(sessionQuery.data.questions) && sessionQuery.data.questions.length > 0) {
          console.log(`Retrieved ${sessionQuery.data.questions.length} questions from session data`);
          
          // Format the questions from the session data
          const formattedQuestions: InterviewQuestion[] = sessionQuery.data.questions.map((q: any, index: number) => ({
            id: q.id || `session-q-${index}`,
            session_id: sessionId,
            question: q.question || q.text || '', // Handle different question formats
            question_order: q.question_order !== undefined ? q.question_order : index,
            created_at: q.created_at || new Date().toISOString()
          }));
          
          setQuestions(formattedQuestions);
        } else {
          console.error("No questions found in any source");
          throw new Error("No questions found in database");
        }
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
