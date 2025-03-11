
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

interface ReminderPayload {
  action: 'schedule' | 'cancel';
  session_id: string;
  student_id?: string;
  title?: string;
  start_time?: string;
}

serve(async (req) => {
  // Create a Supabase client with the admin key
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get session data from request
  const { action, session_id, student_id, title, start_time } = await req.json() as ReminderPayload;

  try {
    if (action === 'schedule') {
      if (!student_id || !title || !start_time) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters for scheduling' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the user's email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', student_id)
        .single();

      if (userError || !userData?.email) {
        console.error('Error fetching user email:', userError);
        return new Response(
          JSON.stringify({ error: 'Could not find user email' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate reminder time (1 hour before session)
      const sessionStartTime = new Date(start_time);
      const reminderTime = new Date(sessionStartTime);
      reminderTime.setHours(reminderTime.getHours() - 1);

      // Store the reminder in the database
      const { data: reminderData, error: reminderError } = await supabase
        .from('session_reminders')
        .insert({
          session_id,
          student_id,
          reminder_time: reminderTime.toISOString(),
          email: userData.email,
          title,
          session_time: start_time,
          status: 'pending'
        })
        .select()
        .single();

      if (reminderError) {
        console.error('Error scheduling reminder:', reminderError);
        return new Response(
          JSON.stringify({ error: 'Failed to schedule reminder' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: reminderData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'cancel') {
      // Cancel any existing reminders for this session
      const { error: deleteError } = await supabase
        .from('session_reminders')
        .delete()
        .eq('session_id', session_id);

      if (deleteError) {
        console.error('Error cancelling reminder:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to cancel reminder' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
