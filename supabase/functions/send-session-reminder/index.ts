
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StudySession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  course_id: string | null;
  student_id: string;
  status: 'scheduled' | 'completed' | 'missed';
  notify_email: boolean;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to check for upcoming sessions and send notifications
async function checkAndSendNotifications() {
  // Get current time
  const now = new Date();
  
  // Get time one hour from now
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  
  // Buffer window (5 minutes) to catch sessions in the next hour
  const bufferEnd = new Date(now.getTime() + 65 * 60 * 1000);

  console.log(`Checking for sessions between ${oneHourFromNow.toISOString()} and ${bufferEnd.toISOString()}`);
  
  // Find sessions that start in approximately one hour and need notifications
  const { data: sessions, error } = await supabase
    .from('study_sessions')
    .select('*')
    .gte('start_time', oneHourFromNow.toISOString())
    .lt('start_time', bufferEnd.toISOString())
    .eq('status', 'scheduled')
    .eq('notify_email', true);
  
  if (error) {
    console.error('Error fetching upcoming sessions:', error);
    return { sent: 0, error: error.message };
  }
  
  if (!sessions || sessions.length === 0) {
    console.log('No upcoming sessions found that require notifications');
    return { sent: 0, sessions: [] };
  }
  
  console.log(`Found ${sessions.length} sessions to send notifications for`);
  
  // Process each session
  let notificationsSent = 0;
  const processedSessions = [];
  
  for (const session of sessions) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', session.student_id)
        .single();
        
      if (userError || !userData) {
        console.error(`Could not find user for session ${session.id}:`, userError);
        continue;
      }
      
      // Get course name if applicable
      let courseName = "N/A";
      if (session.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('title')
          .eq('id', session.course_id)
          .single();
          
        if (courseData) {
          courseName = courseData.title;
        }
      }
      
      // Format times for display
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      const timeFormat = new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
      const dateFormat = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      
      // Compose email
      const emailContent = {
        to: userData.email,
        subject: `Reminder: Study Session in 1 hour - ${session.title}`,
        html: `
          <h2>Study Session Reminder</h2>
          <p>Hello ${userData.first_name || 'Student'},</p>
          <p>This is a reminder that you have a study session scheduled in about an hour:</p>
          <div style="margin: 20px; padding: 15px; border-left: 4px solid #2563eb; background-color: #f3f4f6;">
            <p><strong>Session:</strong> ${session.title}</p>
            <p><strong>Date:</strong> ${dateFormat.format(startTime)}</p>
            <p><strong>Time:</strong> ${timeFormat.format(startTime)} - ${timeFormat.format(endTime)}</p>
            <p><strong>Course:</strong> ${courseName}</p>
            ${session.description ? `<p><strong>Description:</strong> ${session.description}</p>` : ''}
          </div>
          <p>Please make sure you're prepared for your session!</p>
          <p>Good luck with your studies!</p>
        `,
        text: `
          Study Session Reminder
          
          Hello ${userData.first_name || 'Student'},
          
          This is a reminder that you have a study session scheduled in about an hour:
          
          Session: ${session.title}
          Date: ${dateFormat.format(startTime)}
          Time: ${timeFormat.format(startTime)} - ${timeFormat.format(endTime)}
          Course: ${courseName}
          ${session.description ? `Description: ${session.description}` : ''}
          
          Please make sure you're prepared for your session!
          
          Good luck with your studies!
        `
      };
      
      // For this example, we'll just log the email that would be sent
      // In a real implementation, you would use an email service like Resend or SendGrid
      console.log(`Would send email to ${userData.email} about session ${session.title}`);
      console.log(`Email subject: ${emailContent.subject}`);
      
      // Mark as processed
      await supabase
        .from('session_reminders')
        .insert({
          session_id: session.id,
          notification_sent_at: new Date().toISOString()
        });
      
      notificationsSent++;
      processedSessions.push({
        sessionId: session.id,
        title: session.title,
        recipient: userData.email
      });
      
    } catch (processError) {
      console.error(`Error processing session ${session.id}:`, processError);
    }
  }
  
  return { 
    sent: notificationsSent, 
    total: sessions.length,
    sessions: processedSessions
  };
}

// Handler for the endpoint
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // This endpoint can be triggered either manually or via a cron job
    const result = await checkAndSendNotifications();
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in send-session-reminder function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
};

serve(handler);
