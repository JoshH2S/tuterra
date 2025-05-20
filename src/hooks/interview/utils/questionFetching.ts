
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
    console.log("No questions found in interview_questions table, trying session data");
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
    console.log(`Attempting to fetch questions from session data for session ${sessionId}`);
    
    // Try fetching with ID column first (primary key)
    let { data, error } = await supabase
      .from('interview_sessions')
      .select('questions, job_title, industry')
      .eq('id', sessionId)
      .maybeSingle();
    
    // If not found via ID column, try with session_id column as fallback
    if (error || !data) {
      console.log(`No session found with id=${sessionId}, trying session_id column as fallback`);
      const response = await supabase
        .from('interview_sessions')
        .select('questions, job_title, industry')
        .eq('session_id', sessionId)
        .maybeSingle();
      
      data = response.data;
      error = response.error;
    }
    
    if (error) {
      console.error("Error fetching session:", error);
      throw new Error(`No questions found in database for session ${sessionId}`);
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
    
    console.error("No questions found in any source for session:", sessionId);
    console.log("Session data:", data);
    
    // If we have job title and industry, we can generate fallback questions
    if (data && data.job_title && data.industry) {
      console.log("Generating emergency fallback questions based on job details");
      return [
        {
          id: `emergency-fallback-1`,
          session_id: sessionId,
          question: `Tell me about your experience and skills relevant to this ${data.job_title} position.`,
          question_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `emergency-fallback-2`,
          session_id: sessionId,
          question: `What interests you about working in the ${data.industry} industry?`,
          question_order: 1,
          created_at: new Date().toISOString()
        }
      ];
    }
    
    throw new Error("No questions found and insufficient data to generate fallbacks");
  } catch (error) {
    console.error("Error in fetchQuestionsFromSessionData:", error);
    throw error;
  }
};
