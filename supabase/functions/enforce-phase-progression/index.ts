
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

    // Parse request body
    const { session_id, current_phase, target_phase } = await req.json();
    
    if (!session_id || current_phase === undefined || target_phase === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate that the session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from('internship_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ success: false, error: "Session not found or access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Check if the current phase matches what's stored in the database
    if (sessionData.current_phase !== current_phase) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Phase mismatch. The session may have been updated elsewhere.",
          actual_phase: sessionData.current_phase
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }
    
    // Check if the target phase is only one step ahead of the current phase
    if (target_phase !== current_phase + 1) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid phase transition. Phases must progress sequentially." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // For phase 3 specifically (which is the project work phase), verify all tasks are completed
    if (target_phase === 3) {
      const { data: tasks, error: tasksError } = await supabase
        .from('internship_tasks')
        .select('id, status')
        .eq('session_id', session_id);
        
      if (tasksError) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to check task completion status" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      const allTasksCompleted = tasks.every(task => task.status === 'feedback_given');
      if (!allTasksCompleted) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "All tasks must be completed before advancing to the next phase" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }
    
    // Update the session phase
    const { error: updateError } = await supabase
      .from('internship_sessions')
      .update({ current_phase: target_phase })
      .eq('id', session_id);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Record the phase completion
    await supabase
      .from('internship_progress')
      .insert({
        user_id: user.id,
        session_id: session_id,
        phase_number: current_phase  // Record the completed phase
      });
      
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully advanced to phase ${target_phase}` 
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
