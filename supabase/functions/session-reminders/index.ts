
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderRequest {
  action: 'schedule' | 'cancel';
  session_id: string;
  student_id?: string;
  title?: string;
  start_time?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, session_id, student_id, title, start_time } = await req.json() as ReminderRequest;
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle different actions
    if (action === 'cancel') {
      // Cancel reminder
      const { error } = await supabase
        .from('session_reminders')
        .update({ status: 'cancelled' })
        .eq('session_id', session_id)
        .eq('status', 'scheduled');
      
      if (error) {
        throw new Error(`Failed to cancel reminder: ${error.message}`);
      }
      
      console.log(`Reminder cancelled for session ${session_id}`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Reminder cancelled successfully' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200 
        }
      );
    } 
    else if (action === 'schedule') {
      // Validate required fields for scheduling
      if (!student_id || !title || !start_time) {
        throw new Error('Missing required parameters for scheduling a reminder');
      }
      
      // Get the session start time
      const startTime = new Date(start_time);
      
      // Calculate reminder time (1 hour before)
      const reminderTime = new Date(startTime.getTime() - 60 * 60 * 1000);
      
      // Check if we need to send the reminder immediately (if session is within 1 hour)
      const now = new Date();
      const sendImmediately = reminderTime <= now && startTime > now;
      
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', student_id)
        .single();
      
      if (userError) {
        throw new Error(`Failed to get user email: ${userError.message}`);
      }
      
      // Schedule the reminder
      if (sendImmediately) {
        // Send reminder immediately if the session is starting in less than an hour
        await sendReminderEmail(userData.email, title, startTime);
        console.log(`Immediate reminder sent for session ${session_id}`);
      } else if (reminderTime > now) {
        // Store the reminder in the database for future processing
        const { error: reminderError } = await supabase
          .from('session_reminders')
          .insert({
            session_id,
            student_id,
            reminder_time: reminderTime.toISOString(),
            email: userData.email,
            session_title: title,
            session_start_time: start_time,
            status: 'scheduled'
          });
        
        if (reminderError) {
          throw new Error(`Failed to schedule reminder: ${reminderError.message}`);
        }
        
        console.log(`Reminder scheduled for ${reminderTime.toISOString()} for session ${session_id}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Reminder scheduled successfully' }),
        { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          status: 200 
        }
      );
    } 
    else {
      throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error('Error handling session reminder:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500 
      }
    );
  }
});

// Helper function to send email
async function sendReminderEmail(email: string, sessionTitle: string, startTime: Date) {
  try {
    // Format the start time
    const formattedTime = startTime.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Here we would call an email service API
    // For example, with Resend, SendGrid, or other services
    console.log(`Sending reminder email to ${email} for session "${sessionTitle}" at ${formattedTime}`);
    
    // Placeholder for actual email sending logic
    // This would be implemented with your chosen email service
    return true;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return false;
  }
}
