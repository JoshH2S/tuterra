
import { supabase } from "@/integrations/supabase/client";
import { InterviewQuestion, EdgeFunctionQuestion, EnhancedInterviewQuestion } from "@/types/interview";
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
    
    // Enhanced job title validation
    const sanitizedJobTitle = params.jobRole.trim();
    if (!sanitizedJobTitle || sanitizedJobTitle === "") {
      throw new Error("Job title cannot be empty or whitespace only");
    }
    
    // Create a clean payload with proper serialization - standardize on jobTitle
    const payload = {
      industry: params.industry.trim(),
      jobTitle: sanitizedJobTitle, // Primary parameter
      jobDescription: params.jobDescription ? params.jobDescription.trim() : "",
      sessionId: params.sessionId
    };
    
    // Log the exact payload being sent to help with debugging
    console.log("Calling generate-interview-questions with payload:", JSON.stringify(payload));
    
    // Use the Supabase client's functions.invoke method instead of direct fetch
    const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
      body: payload
    });
    
    if (error) {
      console.error("Error invoking generate-interview-questions function:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    console.log("Edge function response:", data);
    
    if (!data) {
      console.error("No data returned from edge function");
      throw new Error("No data returned from the server");
    }
    
    const response_data = data as EdgeFunctionResponse;
    
    if (response_data?.questions && Array.isArray(response_data.questions)) {
      console.log(`Received ${response_data.questions.length} questions from edge function`);
      
      // Check if we have enhanced questions with the new format
      const hasEnhancedFormat = response_data.questions.length > 0 && 
                              'text' in response_data.questions[0] && 
                              'category' in response_data.questions[0];

      if (hasEnhancedFormat) {
        // Process enhanced question format
        const formattedQuestions: InterviewQuestion[] = response_data.questions.map((q: EnhancedInterviewQuestion, index: number) => ({
          id: q.id || `q-${crypto.randomUUID()}`,
          session_id: params.sessionId,
          question: q.text || '', // Text field contains the question
          question_order: q.question_order !== undefined ? q.question_order : index,
          created_at: q.created_at || new Date().toISOString()
        }));
        return formattedQuestions;
      } else {
        // Process legacy question format
        const formattedQuestions: InterviewQuestion[] = response_data.questions.map((q: EdgeFunctionQuestion, index: number) => ({
          id: q.id || `q-${crypto.randomUUID()}`,
          session_id: params.sessionId,
          question: q.question || q.text || '', // Map text field to question field
          question_order: q.question_order || index,
          created_at: q.created_at || new Date().toISOString()
        }));
        return formattedQuestions;
      }
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
