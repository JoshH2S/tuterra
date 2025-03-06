
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
    
    // Query for feedback
    const { data, error } = await supabase
      .from('interview_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If no feedback found, return empty response
    if (!data) {
      return new Response(
        JSON.stringify({ feedback: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Process the feedback data to ensure it has the expected structure
    const processedFeedback = {
      id: data.id,
      session_id: data.session_id,
      feedback: data.feedback?.feedback || data.feedback || '',
      strengths: Array.isArray(data.strengths) ? data.strengths : 
                (data.feedback?.strengths || []),
      areas_for_improvement: Array.isArray(data.areas_for_improvement) ? data.areas_for_improvement : 
                            (data.feedback?.areas_for_improvement || []),
      overall_score: typeof data.overall_score === 'number' ? data.overall_score : 
                    (data.feedback?.overall_score || 0),
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return new Response(
      JSON.stringify({ feedback: processedFeedback }),
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
