
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

  // Add schema verification at the start
  try {
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('interview_sessions')
      .select()
      .limit(1);
      
    console.log("Current table schema:", {
      error: schemaError?.message,
      columns: schemaInfo && schemaInfo.length > 0 ? Object.keys(schemaInfo[0]) : []
    });
  } catch (e) {
    console.error("Failed to check schema:", e);
  }

  try {
    // Log headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { sessionId, industry, role, jobDescription } = body;
    
    console.log("Create session request received:", { sessionId, industry, role });
    
    // Validate input
    if (!sessionId || !industry || !role) {
      console.error("Missing required parameters:", { sessionId, industry, role });
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          received: { sessionId, industry, role }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Add logging before database operation
    console.log("Attempting to create session in database:", {
      session_id: sessionId,
      industry,
      job_title: role
    });
    
    // Create the interview session with empty questions initially
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        session_id: sessionId,
        job_title: role,
        industry,
        job_description: jobDescription || null,
        questions: [],
        status: 'created'
      })
      .select('id');
    
    // Add more logging after the insert query
    console.log("Session creation result:", { data, error });

    if (error) {
      console.error("Failed to create session:", error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error.details
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error("No session data returned after creation");
      return new Response(
        JSON.stringify({ 
          error: "Failed to create session - no data returned",
          received: { sessionId, industry, role }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Session created successfully:", { sessionId, dbId: data[0].id });
    
    return new Response(
      JSON.stringify({ success: true, id: data[0].id }),
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
