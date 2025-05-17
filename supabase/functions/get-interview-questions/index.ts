
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request, ensuring we have a valid format
    let requestBody: { sessionId: string };
    
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse request body",
          details: parseError.message 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { sessionId } = requestBody;
    
    if (!sessionId) {
      console.error("Missing session ID");
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Fetching questions for session ID: ${sessionId}`);
    
    // First, try the internship_sessions table (most common source for internship interviews)
    const { data: internshipData, error: internshipError } = await supabase
      .from('internship_sessions')
      .select('questions, job_title, industry')
      .eq('id', sessionId)
      .single();
    
    // Track where we found the questions for debugging
    let questionSource = null;
    let questions = null;
      
    if (!internshipError && internshipData && internshipData.questions && 
        Array.isArray(internshipData.questions) && internshipData.questions.length > 0) {
      console.log(`Found ${internshipData.questions.length} questions in internship_sessions table`);
      questionSource = 'internship_sessions';
      
      // Map the questions to ensure they match expected format
      questions = internshipData.questions.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}-${Date.now()}`,
        session_id: sessionId,
        question: q.text || q.question || '',  // Handle different question formats
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
    }
    
    // Next, try the interview_questions table if we didn't find anything yet
    if (!questions) {
      const { data: questionData, error: questionError } = await supabase
        .from('interview_questions')
        .select('id, session_id, question, question_order, created_at')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (!questionError && questionData && questionData.length > 0) {
        console.log(`Found ${questionData.length} questions in interview_questions table`);
        questionSource = 'interview_questions';
        questions = questionData;
      }
    }
    
    // Then check interview_sessions table as fallback if we still don't have questions
    if (!questions) {
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('questions')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) {
        // If not found by 'id', try by 'session_id'
        const { data: altSessionData, error: altSessionError } = await supabase
          .from('interview_sessions')
          .select('questions')
          .eq('session_id', sessionId)
          .single();
          
        if (!altSessionError && altSessionData && altSessionData.questions && 
            Array.isArray(altSessionData.questions) && altSessionData.questions.length > 0) {
          console.log(`Found ${altSessionData.questions.length} questions in interview_sessions table (by session_id)`);
          questionSource = 'interview_sessions (by session_id)';
          
          // Format questions for consistency
          questions = altSessionData.questions.map((q: any, index: number) => ({
            id: q.id || `session-q-${index}-${Date.now()}`,
            session_id: sessionId,
            question: q.text || q.question || '',
            question_order: q.question_order !== undefined ? q.question_order : index,
            created_at: q.created_at || new Date().toISOString()
          }));
        }
      } else if (sessionData && sessionData.questions && 
                Array.isArray(sessionData.questions) && sessionData.questions.length > 0) {
        console.log(`Found ${sessionData.questions.length} questions in interview_sessions table (by id)`);
        questionSource = 'interview_sessions (by id)';
        
        // Format questions for consistency
        questions = sessionData.questions.map((q: any, index: number) => ({
          id: q.id || `session-q-${index}-${Date.now()}`,
          session_id: sessionId,
          question: q.text || q.question || '',
          question_order: q.question_order !== undefined ? q.question_order : index,
          created_at: q.created_at || new Date().toISOString()
        }));
      }
    }
    
    // If we've found questions by any method, return them
    if (questions && questions.length > 0) {
      console.log(`Returning ${questions.length} questions from ${questionSource}`);
      return new Response(
        JSON.stringify({
          questions,
          source: questionSource,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // If we still don't have questions, try to get session details to generate fallback ones
    const { data: sessionDetails } = await supabase
      .from('internship_sessions')
      .select('job_title, industry')
      .eq('id', sessionId)
      .single();
      
    if (sessionDetails && sessionDetails.job_title && sessionDetails.industry) {
      console.log("No questions found but session details available. Generating fallback questions.");
      
      // Create fallback questions with unique timestamps to prevent duplicate IDs
      const timestamp = Date.now();
      const fallbackQuestions = [
        {
          id: `fallback-q-1-${sessionId}-${timestamp}`,
          session_id: sessionId,
          question: `Tell me about your experience and skills relevant to this ${sessionDetails.job_title} position.`,
          question_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `fallback-q-2-${sessionId}-${timestamp}`,
          session_id: sessionId,
          question: `What interests you about working in the ${sessionDetails.industry} industry?`,
          question_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: `fallback-q-3-${sessionId}-${timestamp}`,
          session_id: sessionId,
          question: "Describe a challenging situation you've faced professionally and how you handled it.",
          question_order: 2,
          created_at: new Date().toISOString()
        }
      ];
      
      // Try to store these fallback questions in the internship_sessions table for future use
      try {
        await supabase
          .from('internship_sessions')
          .update({ questions: fallbackQuestions })
          .eq('id', sessionId);
          
        console.log("Saved fallback questions to internship_sessions table");
      } catch (updateError) {
        console.warn("Failed to update internship_sessions with fallback questions:", updateError);
      }
      
      return new Response(
        JSON.stringify({ 
          questions: fallbackQuestions,
          source: "generated_fallback",
          message: "Using fallback questions as original questions were not found."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Last resort - return empty questions array with message
    // This prevents errors on the frontend and lets it handle the no-questions state
    return new Response(
      JSON.stringify({ 
        questions: [],
        source: "empty",
        message: "No questions found for this session and cannot generate fallbacks." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Even in case of error, return a 200 response with empty questions
    // This prevents the frontend from getting stuck in error/retry loops
    return new Response(
      JSON.stringify({ 
        questions: [],
        error: error.message || "An unexpected error occurred",
        source: "error",
        message: "Returning empty questions to prevent frontend errors"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
