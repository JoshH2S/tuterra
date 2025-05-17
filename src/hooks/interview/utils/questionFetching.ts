
import { supabase } from "@/integrations/supabase/client";
import { InterviewQuestion } from "@/types/interview";

/**
 * Fetches questions from the database for a given session
 */
export const fetchQuestionsFromDb = async (sessionId: string): Promise<InterviewQuestion[]> => {
  console.log(`Fetching questions for session ${sessionId}`);
  
  try {
    console.log("Invoking get-interview-questions edge function");
    
    // Use the get-interview-questions edge function for consistent handling
    const { data, error } = await supabase.functions.invoke('get-interview-questions', {
      body: { sessionId }
    });
    
    if (error) {
      console.error("Error invoking get-interview-questions edge function:", error);
      throw error;
    }
    
    console.log("Response from get-interview-questions:", data);
    
    // Check if questions exist in the response
    const questions = data?.questions;
    
    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log(`Retrieved ${questions.length} questions via edge function`);
      
      // Format questions to ensure consistency
      const formattedQuestions: InterviewQuestion[] = questions.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}`,
        session_id: q.session_id || sessionId,
        question: q.question || q.text || '',  // Handle different question formats
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      console.log("Formatted questions:", JSON.stringify(formattedQuestions.map(q => ({ id: q.id, question: q.question }))));
      return formattedQuestions;
    }
    
    // If we got a response but no questions array, check if the data itself is the array
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`Retrieved ${data.length} questions directly from edge function response`);
      
      const formattedQuestions: InterviewQuestion[] = data.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}`,
        session_id: q.session_id || sessionId,
        question: q.question || q.text || '',
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      console.log("Formatted direct questions:", JSON.stringify(formattedQuestions.map(q => ({ id: q.id, question: q.question }))));
      return formattedQuestions;
    }
    
    // Check if we have a message about why no questions
    if (data?.message) {
      console.warn("Server response message:", data.message);
    }
    
    // If we still have no questions, return an empty array but don't throw an error
    // This prevents redirect loops when questions aren't available
    console.warn(`No questions found for session ${sessionId} via edge function, returning empty array`);
    return [];
  } catch (error) {
    console.error("Error in fetchQuestionsFromDb:", error);
    // Return empty array instead of throwing to prevent redirect loops
    return [];
  }
};

/**
 * Fetches questions from the session data's JSON field as a fallback
 * This is a legacy function that is kept for backwards compatibility
 */
export const fetchQuestionsFromSessionData = async (sessionId: string): Promise<InterviewQuestion[]> => {
  console.log("Using legacy fetchQuestionsFromSessionData as fallback");
  
  try {
    // Call the edge function instead for consistent handling
    return await fetchQuestionsFromDb(sessionId);
  } catch (error) {
    console.error("Error in legacy fetchQuestionsFromSessionData:", error);
    // Return empty array instead of throwing
    return [];
  }
};
