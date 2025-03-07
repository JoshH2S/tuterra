
import { supabase } from "@/integrations/supabase/client";
import { InterviewQuestion } from "@/types/interview";

/**
 * Fetches questions from the database for a given session
 */
export const fetchQuestionsFromDb = async (sessionId: string): Promise<InterviewQuestion[]> => {
  console.log(`Fetching questions for session ${sessionId}`);
  
  try {
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
      return fetchQuestionsFromSessionData(sessionId);
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
      
      return formattedQuestions;
    } 
    
    // If no questions found in the direct table, try the JSON field
    console.log("No questions found in interview_questions table");
    return fetchQuestionsFromSessionData(sessionId);
  } catch (error) {
    console.error("Error in fetchQuestionsFromDb:", error);
    throw error;
  }
};

/**
 * Fetches questions from the session data's JSON field as a fallback
 */
export const fetchQuestionsFromSessionData = async (sessionId: string): Promise<InterviewQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('questions')
      .eq('session_id', sessionId)
      .single();
    
    if (error) {
      console.error("Error fetching session:", error);
      throw new Error("No questions found in database");
    }
    
    if (data && Array.isArray(data.questions) && data.questions.length > 0) {
      console.log(`Retrieved ${data.questions.length} questions from session data`);
      
      // Format the questions from the session data
      const formattedQuestions: InterviewQuestion[] = data.questions.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}`,
        session_id: sessionId,
        question: q.question || q.text || '', // Handle different question formats
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      return formattedQuestions;
    } 
    
    console.error("No questions found in any source");
    throw new Error("No questions found in database");
  } catch (error) {
    console.error("Error in fetchQuestionsFromSessionData:", error);
    throw error;
  }
};
