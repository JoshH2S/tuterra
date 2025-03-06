
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
    
    // Query the interview_questions table directly
    const { data, error } = await supabase
      .from('interview_questions')
      .select('id, session_id, text, category, difficulty, estimatedTimeSeconds, keywords, question_order, created_at')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });
    
    if (error) {
      // If there's an error with the direct query (e.g., table doesn't exist),
      // try to get questions from the interview_sessions table's questions JSON field
      const sessionQuery = await supabase
        .from('interview_sessions')
        .select('questions')
        .eq('session_id', sessionId)
        .single();
      
      if (sessionQuery.error) {
        return new Response(
          JSON.stringify({ error: "Failed to retrieve questions" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      if (sessionQuery.data && Array.isArray(sessionQuery.data.questions)) {
        return new Response(
          JSON.stringify({ questions: sessionQuery.data.questions }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ questions: data || [] }),
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
