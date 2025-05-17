
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
    const { sessionId } = await req.json();
    
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
      
    if (!internshipError && internshipData && internshipData.questions && 
        Array.isArray(internshipData.questions) && internshipData.questions.length > 0) {
      console.log(`Found ${internshipData.questions.length} questions in internship_sessions table`);
      
      // Map the questions to ensure they match expected format
      const formattedQuestions = internshipData.questions.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}`,
        session_id: sessionId,
        question: q.text || q.question || '',  // Handle different question formats
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      return new Response(
        JSON.stringify({ questions: formattedQuestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Next, try the interview_questions table
    const { data: questionData, error: questionError } = await supabase
      .from('interview_questions')
      .select('id, session_id, question, question_order, created_at')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });
    
    if (!questionError && questionData && questionData.length > 0) {
      console.log(`Found ${questionData.length} questions in interview_questions table`);
      return new Response(
        JSON.stringify({ questions: questionData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Then check interview_sessions table as fallback
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
        
        // Format questions for consistency
        const formattedQuestions = altSessionData.questions.map((q: any, index: number) => ({
          id: q.id || `session-q-${index}`,
          session_id: sessionId,
          question: q.text || q.question || '',
          question_order: q.question_order !== undefined ? q.question_order : index,
          created_at: q.created_at || new Date().toISOString()
        }));
        
        return new Response(
          JSON.stringify({ questions: formattedQuestions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } else if (sessionData && sessionData.questions && 
               Array.isArray(sessionData.questions) && sessionData.questions.length > 0) {
      console.log(`Found ${sessionData.questions.length} questions in interview_sessions table (by id)`);
      
      // Format questions for consistency
      const formattedQuestions = sessionData.questions.map((q: any, index: number) => ({
        id: q.id || `session-q-${index}`,
        session_id: sessionId,
        question: q.text || q.question || '',
        question_order: q.question_order !== undefined ? q.question_order : index,
        created_at: q.created_at || new Date().toISOString()
      }));
      
      return new Response(
        JSON.stringify({ questions: formattedQuestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Try to get the session details to generate fallback questions if no questions found
    const { data: sessionDetails } = await supabase
      .from('internship_sessions')
      .select('job_title, industry')
      .eq('id', sessionId)
      .single();
      
    if (sessionDetails && sessionDetails.job_title && sessionDetails.industry) {
      console.log("No questions found but session details available. Generating generic questions.");
      
      // Create generic fallback questions
      const fallbackQuestions = [
        {
          id: `fallback-q-1-${sessionId}`,
          session_id: sessionId,
          question: `Tell me about your experience and skills relevant to this ${sessionDetails.job_title} position.`,
          question_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `fallback-q-2-${sessionId}`,
          session_id: sessionId,
          question: `What interests you about working in the ${sessionDetails.industry} industry?`,
          question_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: `fallback-q-3-${sessionId}`,
          session_id: sessionId,
          question: "Describe a challenging situation you've faced professionally and how you handled it.",
          question_order: 2,
          created_at: new Date().toISOString()
        }
      ];
      
      // Store these fallback questions in the internship_sessions table
      await supabase
        .from('internship_sessions')
        .update({ questions: fallbackQuestions })
        .eq('id', sessionId);
      
      return new Response(
        JSON.stringify({ 
          questions: fallbackQuestions,
          message: "Using fallback questions as original questions were not found."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // No questions found in any source and no session details to generate fallbacks
    console.log(`No questions or session details found for session ID: ${sessionId}`);
    return new Response(
      JSON.stringify({ 
        questions: [],
        message: "No questions found for this session and cannot generate fallbacks." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
