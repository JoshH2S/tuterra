
import { supabase } from "@/integrations/supabase/client";
import { InterviewQuestion, EdgeFunctionQuestion } from "@/types/interview";
import { EdgeFunctionResponse, QuestionGenerationParams } from "../types/questionTypes";

/**
 * Calls the edge function to generate interview questions
 */
export const generateQuestionsFromApi = async (
  params: QuestionGenerationParams,
  onError: (error: Error) => void
): Promise<InterviewQuestion[]> => {
  try {
    // Validate params before sending
    if (!params.sessionId || !params.industry || !params.jobRole) {
      const missingFields = [];
      if (!params.sessionId) missingFields.push('sessionId');
      if (!params.industry) missingFields.push('industry');
      if (!params.jobRole) missingFields.push('jobRole');
      
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Create a clean payload that's guaranteed to have the required fields
    const payload = {
      industry: params.industry,
      jobRole: params.jobRole,
      jobDescription: params.jobDescription || "",
      sessionId: params.sessionId
    };
    
    console.log("Calling generate-interview-questions edge function with payload:", JSON.stringify(payload));
    
    // Call the edge function with the clean payload
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
    
    const response = data as EdgeFunctionResponse;
    
    if (response?.questions && Array.isArray(response.questions)) {
      console.log(`Received ${response.questions.length} questions from edge function`);
      
      // Process the questions from edge function's format to our application format
      const formattedQuestions: InterviewQuestion[] = response.questions.map((q: EdgeFunctionQuestion, index: number) => ({
        id: q.id || `q-${crypto.randomUUID()}`,
        session_id: params.sessionId,
        question: q.text || '', // Map text field to question field
        question_order: q.question_order || index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      return formattedQuestions;
    } else {
      console.error("Questions array missing or invalid in response:", data);
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error generating questions from API:", error);
    onError(error instanceof Error ? error : new Error("Unknown error occurred"));
    throw error;
  }
};
