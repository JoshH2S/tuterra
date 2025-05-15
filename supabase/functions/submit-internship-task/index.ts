
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
    const { 
      task_id, 
      session_id, 
      content, 
      attachment_url, 
      attachment_name,
      job_title,
      industry
    } = await req.json();
    
    // Validate input
    if (!task_id || !session_id || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Task ID, session ID, and content are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verify that the task belongs to the provided session and is not already completed
    const { data: taskData, error: taskError } = await supabase
      .from('internship_tasks')
      .select('*')
      .eq('id', task_id)
      .eq('session_id', session_id)
      .single();
      
    if (taskError) {
      console.error("Error fetching task:", taskError);
      return new Response(
        JSON.stringify({ success: false, error: "Task not found or access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    if (taskData.status === 'feedback_given') {
      return new Response(
        JSON.stringify({ success: false, error: "This task already has feedback and cannot be resubmitted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Verify that the session belongs to the user
    const { data: sessionData, error: sessionError } = await supabase
      .from('internship_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError) {
      console.error("Error verifying session ownership:", sessionError);
      return new Response(
        JSON.stringify({ success: false, error: "Session not found or access denied" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Use a transactional approach for submission and feedback generation
    try {
      // 1. Insert the deliverable
      const { data: deliverableData, error: deliverableError } = await supabase
        .from('internship_deliverables')
        .insert({
          task_id: task_id,
          user_id: user.id,
          content: content,
          attachment_url: attachment_url || null,
          attachment_name: attachment_name || null
        })
        .select()
        .single();

      if (deliverableError) throw deliverableError;

      // 2. Update the task status
      const { error: taskUpdateError } = await supabase
        .from('internship_tasks')
        .update({ status: 'submitted' })
        .eq('id', task_id);

      if (taskUpdateError) throw taskUpdateError;

      // 3. Generate feedback using the standard generate-internship-feedback function
      const feedbackResponse = await fetch(`${supabaseUrl}/functions/v1/generate-internship-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        },
        body: JSON.stringify({
          task_id: task_id,
          deliverable_id: deliverableData.id,
          submission: content,
          job_title: job_title,
          industry: industry
        })
      });

      const feedbackResult = await feedbackResponse.json();
      
      if (!feedbackResult.success) {
        throw new Error(feedbackResult.error || 'Failed to generate feedback');
      }

      // 4. Update task status to "feedback_given"
      const { error: finalUpdateError } = await supabase
        .from('internship_tasks')
        .update({ status: 'feedback_given' })
        .eq('id', task_id);

      if (finalUpdateError) throw finalUpdateError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          deliverable: deliverableData,
          feedback: feedbackResult.feedback[0]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      
      // Attempt to roll back to a consistent state
      await supabase
        .from('internship_tasks')
        .update({ status: 'not_started' })
        .eq('id', task_id);
        
      return new Response(
        JSON.stringify({ success: false, error: transactionError instanceof Error ? transactionError.message : "Transaction failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
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
