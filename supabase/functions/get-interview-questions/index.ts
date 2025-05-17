
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
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Fetching questions for session ID: ${sessionId}`);
    
    // First, try the interview_questions table directly
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
    
    // Next, check internship_sessions (primary source for internship questions)
    const { data: internshipData, error: internshipError } = await supabase
      .from('internship_sessions')
      .select('questions')
      .eq('id', sessionId)
      .single();
      
    if (!internshipError && internshipData && internshipData.questions && 
        Array.isArray(internshipData.questions) && internshipData.questions.length > 0) {
      console.log(`Found ${internshipData.questions.length} questions in internship_sessions table`);
      return new Response(
        JSON.stringify({ questions: internshipData.questions }),
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
        return new Response(
          JSON.stringify({ questions: altSessionData.questions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } else if (sessionData && sessionData.questions && 
               Array.isArray(sessionData.questions) && sessionData.questions.length > 0) {
      console.log(`Found ${sessionData.questions.length} questions in interview_sessions table (by id)`);
      return new Response(
        JSON.stringify({ questions: sessionData.questions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // No questions found in any source
    console.log(`No questions found for session ID: ${sessionId}`);
    return new Response(
      JSON.stringify({ questions: [], message: "No questions found for this session" }),
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
