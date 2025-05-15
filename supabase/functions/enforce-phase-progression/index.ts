
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { session_id, current_phase, next_phase } = await req.json();

    // Validate parameters
    if (!session_id || typeof current_phase !== 'number' || typeof next_phase !== 'number') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify that session exists and belongs to the authenticated user
    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('internship_sessions')
      .select('user_id, current_phase')
      .eq('id', session_id)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Security check: Ensure session belongs to authenticated user
    if (sessionData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'You do not have permission to modify this session' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phase progression
    if (sessionData.current_phase !== current_phase) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Phase mismatch. Current phase in database: ${sessionData.current_phase}, requested: ${current_phase}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify next phase is valid (only allow incrementing by 1)
    if (next_phase !== current_phase + 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phase progression' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Start a transaction to ensure both operations succeed or fail together
    const { data, error } = await supabaseClient.rpc('handle_phase_progression', {
      p_session_id: session_id,
      p_user_id: user.id,
      p_current_phase: current_phase,
      p_next_phase: next_phase
    });

    if (error) {
      console.error('Transaction error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully progressed from phase ${current_phase} to ${next_phase}`,
        data
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
