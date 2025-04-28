
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize SendGrid API key
const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY") || "";

// Helper function to send email using SendGrid
const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: {
        email: "noreply@yourdomain.com", // ✅ Replace with your verified SendGrid sender
        name: "Tuterra Study Reminder",
      },
      content: [
        {
          type: "text/html",
          value: html,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SendGrid email failed: ${errorText}`);
  }
};

const sendSessionReminder = async () => {
  console.log("Checking for study sessions that need reminders...");

  const now = new Date();
  const oneHourFromNow = new Date(now);
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

  const startWindow = new Date(oneHourFromNow);
  startWindow.setMinutes(startWindow.getMinutes() - 5);

  const endWindow = new Date(oneHourFromNow);
  endWindow.setMinutes(endWindow.getMinutes() + 5);

  const startTime = startWindow.toISOString();
  const endTime = endWindow.toISOString();

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

  for (const session of sessions) {
    const studentEmail = session.profiles?.email;
    if (!studentEmail) {
      console.error(`No email found for student: ${session.student_id}`);
      continue;
    }

    try {
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

      // Send the email using SendGrid
      await sendEmail(
        studentEmail,
        `Reminder: Your study session "${session.title}" starts in 1 hour`,
        `
        <html>
          <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #B8860B;">Study Session Reminder</h2>
              <p>Hello,</p>
              <p>This is a friendly reminder that your scheduled study session <strong>${session.title}</strong> starts in 1 hour.</p>
              <div style="background: #FFF8DC; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                ${session.description ? `<p><strong>Description:</strong> ${session.description}</p>` : ""}
              </div>
              <p style="margin-top: 20px;">Prepare your study materials and good luck!</p>
              <p style="margin-top: 20px; font-size: 12px; color: gray;">&copy; ${new Date().getFullYear()} Tuterra. All rights reserved.</p>
            </div>
          </body>
        </html>
        `
      );

      // Log the reminder
      const { error: logError } = await supabase
        .from("session_reminders")
        .insert({
          session_id: session.id,
          student_id: session.student_id,
          email: studentEmail,
          session_title: session.title,
          session_start_time: session.start_time,
          reminder_time: new Date().toISOString(),
          status: "sent"
        });

      if (logError) {
        console.error("Error logging reminder:", logError);
      }

      results.push({
        session_id: session.id,
        email: studentEmail,
        status: "sent",
      });

    } catch (err) {
      console.error(`Error sending reminder for session ${session.id}:`, err);
      results.push({
        session_id: session.id,
        status: "error",
        error: err.message,
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
