
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
    
    // Ensure job title is properly trimmed and sanitized
    const sanitizedJobTitle = params.jobRole.trim();
    if (sanitizedJobTitle === "") {
      throw new Error("Job title cannot be empty");
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
    
    // Use the environment variable for Supabase URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nhlsrtubyvggtkyrhkuu.supabase.co';
    const functionUrl = `${supabaseUrl}/functions/v1/generate-interview-questions`;
    
    console.log("Endpoint URL:", functionUrl);
    
    // Get the current session access token
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    if (!accessToken) {
      console.log("No authentication token available. Using anonymous access.");
    }
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from edge function:", response.status, errorText);
      throw new Error(`Edge function error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
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
          question: q.text || '', // Map text field to question field
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
