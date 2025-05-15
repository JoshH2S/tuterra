
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
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user with the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse the request body
    const { job_title, industry, job_description } = await req.json();
    
    // Validate input
    if (!job_title || !industry) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Job title and industry are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Check if user already has an active internship with the same job title & industry
    const { data: existingSessions, error: checkError } = await supabase
      .from('internship_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_title', job_title)
      .eq('industry', industry);
      
    if (checkError) {
      console.error("Error checking existing sessions:", checkError);
      return new Response(
        JSON.stringify({ success: false, error: checkError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If the user already has an internship with these criteria, return it instead of creating a new one
    if (existingSessions && existingSessions.length > 0) {
      console.log(`User already has an internship session with id ${existingSessions[0].id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "You already have an internship with these criteria",
          sessionId: existingSessions[0].id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create a new internship session
    const { data: sessionData, error: insertError } = await supabase
      .from("internship_sessions")
      .insert({
        user_id: user.id,
        job_title: job_title,
        industry: industry,
        job_description: job_description || null,
        created_at: new Date().toISOString(),
        current_phase: 1,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating internship session:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create an initial progress entry
    await supabase
      .from("internship_progress")
      .insert({
        user_id: user.id,
        session_id: sessionData.id,
        phase_number: 0,  // Starting phase
      });

    console.log(`New internship session created with id ${sessionData.id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId: sessionData.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
