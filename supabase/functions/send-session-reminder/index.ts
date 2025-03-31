
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@1.0.0";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend client
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

const sendSessionReminder = async () => {
  console.log("Checking for study sessions that need reminders...");

  const now = new Date();
  // Calculate one hour from now
  const oneHourFromNow = new Date(now);
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
  
  // Add a 5-minute buffer to ensure we catch all relevant sessions
  const startWindow = new Date(oneHourFromNow);
  startWindow.setMinutes(startWindow.getMinutes() - 5);
  
  const endWindow = new Date(oneHourFromNow);
  endWindow.setMinutes(endWindow.getMinutes() + 5);
  
  // Format dates for database query
  const startTime = startWindow.toISOString();
  const endTime = endWindow.toISOString();

  // Find sessions that:
  // 1. Start approximately one hour from now
  // 2. Have notifications enabled
  // 3. Haven't had reminders sent yet
  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select(`
      id,
      title,
      description,
      start_time,
      student_id,
      course_id,
      profiles(email)
    `)
    .eq("status", "scheduled")
    .eq("notify_user", true)
    .gte("start_time", startTime)
    .lte("start_time", endTime)
    .not("id", "in", (rq) => {
      return rq
        .from("session_reminders")
        .select("session_id")
        .eq("status", "sent");
    });

  if (error) {
    console.error("Error fetching sessions:", error);
    return { error };
  }

  console.log(`Found ${sessions?.length || 0} sessions needing reminders`);

  if (!sessions || sessions.length === 0) {
    return { message: "No reminders to send" };
  }

  const results = [];

  // Send email reminders for each session
  for (const session of sessions) {
    const studentEmail = session.profiles?.email;
    if (!studentEmail) {
      console.error(`No email found for student: ${session.student_id}`);
      continue;
    }

    try {
      // Format the session start time to be more readable
      const sessionStartTime = new Date(session.start_time);
      const formattedTime = sessionStartTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const formattedDate = sessionStartTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });

      // Send the email
      const emailResult = await resend.emails.send({
        from: "Study Reminder <noreply@yourapp.com>",
        to: studentEmail,
        subject: `Reminder: Your study session "${session.title}" starts in 1 hour`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Study Session Reminder</h2>
            <p>Your scheduled study session <strong>${session.title}</strong> starts in 1 hour.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #5c6ac4; padding: 15px; margin: 20px 0;">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${session.description ? `<p><strong>Description:</strong> ${session.description}</p>` : ''}
            </div>
            <p>Good luck with your studies!</p>
          </div>
        `
      });

      console.log("Email sent:", emailResult);

      // Log the reminder in the database
      const { data: reminderLog, error: logError } = await supabase
        .from("session_reminders")
        .insert({
          session_id: session.id,
          student_id: session.student_id,
          email: studentEmail,
          session_title: session.title,
          session_start_time: session.start_time,
          reminder_time: new Date().toISOString(),
          status: "sent"
        })
        .select()
        .single();

      if (logError) {
        console.error("Error logging reminder:", logError);
      }

      results.push({
        session_id: session.id,
        email: studentEmail,
        status: "sent"
      });

    } catch (err) {
      console.error(`Error sending reminder for session ${session.id}:`, err);
      results.push({
        session_id: session.id,
        status: "error",
        error: err.message
      });
    }
  }

  return { results };
};

serve(async () => {
  try {
    const result = await sendSessionReminder();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-session-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
