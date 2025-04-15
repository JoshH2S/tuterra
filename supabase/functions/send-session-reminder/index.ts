
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

      // Send the email with improved styling
      const emailResult = await resend.emails.send({
        from: "Tuterra Study Reminder <noreply@yourapp.com>",
        to: studentEmail,
        subject: `Reminder: Your study session "${session.title}" starts in 1 hour`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
            <title>Study Session Reminder</title>
            <style>
              body {
                font-family: 'Quicksand', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                color: #333333;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              }
              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 2px solid #FFF8DC;
              }
              .logo {
                max-width: 180px;
                height: auto;
              }
              .content {
                padding: 20px 0;
              }
              h1 {
                color: #B8860B;
                font-size: 24px;
                margin-bottom: 16px;
                font-weight: 600;
              }
              .session-details {
                background-color: #FFF8DC;
                border-left: 4px solid #B8860B;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .session-item {
                margin-bottom: 8px;
              }
              .label {
                font-weight: 600;
                color: #8B4513;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #FFD700, #B8860B);
                color: #333;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .button:hover {
                background: linear-gradient(135deg, #B8860B, #8B4513);
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #777;
                font-size: 14px;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
              @media screen and (max-width: 480px) {
                .container {
                  padding: 15px;
                }
                h1 {
                  font-size: 20px;
                }
                .button {
                  display: block;
                  text-align: center;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://lovable-uploads.s3.amazonaws.com/7ab2ba58-1918-4a73-85e1-7793751f29b4.png" alt="Tuterra Logo" class="logo">
              </div>
              <div class="content">
                <h1>Your Study Session Starts Soon</h1>
                <p>Hello,</p>
                <p>This is a friendly reminder that your scheduled study session <strong>${session.title}</strong> starts in 1 hour.</p>
                
                <div class="session-details">
                  <div class="session-item">
                    <span class="label">Date:</span> ${formattedDate}
                  </div>
                  <div class="session-item">
                    <span class="label">Time:</span> ${formattedTime}
                  </div>
                  ${session.description ? `
                  <div class="session-item">
                    <span class="label">Description:</span> ${session.description}
                  </div>
                  ` : ''}
                </div>
                
                <p>Prepare your study materials and find a quiet space to maximize your learning effectiveness.</p>
                
                <a href="https://yourapp.com/sessions/${session.id}" class="button">View Session Details</a>
                
                <p>Good luck with your studies!</p>
              </div>
              <div class="footer">
                <p>This email was sent automatically by Tuterra. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} Tuterra. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
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
