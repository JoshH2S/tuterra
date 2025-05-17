
import { supabase } from "@/integrations/supabase/client";
import { InterviewQuestion } from "@/types/interview";

/**
 * Fetches questions from the database for a given session
 * Enhanced with retry logic and consistent format handling
 */
export const fetchQuestionsFromDb = async (sessionId: string, retryAttempts = 3): Promise<InterviewQuestion[]> => {
  console.log(`Fetching questions for session ${sessionId} (attempt 1/${retryAttempts + 1})`);
  
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= retryAttempts) {
    try {
      if (attempts > 0) {
        console.log(`Retry attempt ${attempts}/${retryAttempts} for session ${sessionId}`);
        // Add exponential backoff between retries
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts - 1)));
      }
      
      // Use the get-interview-questions edge function for consistent handling
      const { data, error } = await supabase.functions.invoke('get-interview-questions', {
        body: { sessionId }
      });
      
      if (error) {
        console.error(`Error invoking get-interview-questions (attempt ${attempts + 1}):`, error);
        lastError = error;
        attempts++;
        continue; // Try again
      }
      
      console.log("Response format from get-interview-questions:", data ? typeof data : 'null', 
        data ? (Array.isArray(data) ? 'array' : 'object') : 'null');
      
      // Standardize question format regardless of response structure
      let questionsList: InterviewQuestion[] = [];
      
      // Handle various response formats
      if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        // Format 1: { questions: [...] }
        questionsList = normalizeQuestions(data.questions, sessionId);
      } else if (data && Array.isArray(data) && data.length > 0) {
        // Format 2: [...]
        questionsList = normalizeQuestions(data, sessionId);
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Format 3: { someKey: [...], otherData: ... }
        // Check for any array properties that might contain questions
        const possibleQuestionArrays = Object.values(data)
          .filter(val => Array.isArray(val) && val.length > 0);
          
        if (possibleQuestionArrays.length > 0) {
          // Use the first array found (most likely to be questions)
          questionsList = normalizeQuestions(possibleQuestionArrays[0] as any[], sessionId);
        }
      }
      
      // If we successfully found and formatted questions
      if (questionsList.length > 0) {
        console.log(`Successfully retrieved ${questionsList.length} questions for session ${sessionId}`);
        return questionsList;
      }
      
      // If data exists but no questions were extracted, log warning and try again
      if (data) {
        console.warn("Response received but no questions extracted:", data);
      } else {
        console.warn("Empty response received");
      }
      
      attempts++;
      
    } catch (error) {
      console.error(`Error in fetchQuestionsFromDb (attempt ${attempts + 1}):`, error);
      lastError = error;
      attempts++;
    }
  }
  
  // If we've exhausted all retries, return an empty array rather than throwing
  console.warn(`Failed to fetch questions after ${retryAttempts + 1} attempts`);
  return [];
};

/**
 * Normalize various question formats into a consistent InterviewQuestion structure
 */
function normalizeQuestions(questions: any[], sessionId: string): InterviewQuestion[] {
  return questions.map((q: any, index: number) => ({
    id: q.id || `session-q-${index}-${Date.now()}`,
    session_id: q.session_id || sessionId,
    question: q.question || q.text || q.content || '',
    question_order: q.question_order !== undefined ? q.question_order : 
                   q.order !== undefined ? q.order : index,
    created_at: q.created_at || new Date().toISOString()
  }));
}

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
