import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://tuterra.ai";

const SENDGRID_BASE = "https://api.sendgrid.com/v3/mail/send";

// Create a Supabase client with service role for database operations
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logEmailAttempt = async ({
  userId,
  success,
  error,
}: {
  userId: string;
  success: boolean;
  error?: string;
}) => {
  try {
    await adminClient.from("email_logs").insert([
      {
        user_id: userId,
        email_type: "promotional_feedback",
        success,
        error_message: error ?? null,
      },
    ]);
  } catch (err) {
    console.error("[FeedbackEmail] Failed to log email attempt:", err?.message ?? err);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Configuration error",
          details: "SendGrid API key is missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get all pending feedback reminders
    const { data: reminders, error: remindersError } = await adminClient
      .from('promotional_feedback_reminders')
      .select(`
        *,
        profiles!inner(email, first_name, last_name),
        internship_sessions!inner(job_title, industry)
      `)
      .lte('scheduled_for', new Date().toISOString())
      .is('sent_at', null)
      .limit(50);

    if (remindersError) {
      console.error('[FeedbackEmail] Error fetching reminders:', remindersError);
      throw remindersError;
    }

    console.log(`[FeedbackEmail] Found ${reminders?.length || 0} feedback reminders to send`);

    const results = [];

    for (const reminder of reminders || []) {
      const { email, first_name } = reminder.profiles;
      const { job_title, industry } = reminder.internship_sessions;
      const feedbackUrl = `${PUBLIC_SITE_URL}/feedback/promotional?session=${reminder.internship_session_id}&user=${reminder.user_id}`;

      // Retry logic for sending the email
      const MAX_RETRIES = 3;
      let attempts = 0;
      let lastError: any = null;
      let success = false;
      let sendgridResponse: Response | null = null;

      while (attempts < MAX_RETRIES) {
        try {
          const emailPayload = {
            personalizations: [
              {
                to: [{ email }],
                subject: `Share Your Experience - ${job_title} Virtual Internship Feedback`,
              },
            ],
            from: {
              email: "admin@tuterra.ai",
              name: "Tuterra",
            },
            content: [
              {
                type: "text/html",
                value: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; }
                        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🎉 Thank You for Being One of Our First!</h1>
                        </div>
                        <div class="content">
                          <p>Hi ${first_name},</p>
                          
                          <p>About a month ago, you completed your <strong>${job_title}</strong> virtual internship in the <strong>${industry}</strong> industry as one of our first 30 users with the FIRST30 promo code.</p>
                          
                          <p>We'd love to hear about your experience! Your feedback will directly shape how we improve Tuterra for future students.</p>
                          
                          <p><strong>The survey takes just 3-5 minutes</strong> and covers:</p>
                          <ul>
                            <li>Overall satisfaction with your virtual internship</li>
                            <li>Features you found most helpful</li>
                            <li>Areas where we can improve</li>
                            <li>Would you recommend Tuterra to others?</li>
                          </ul>
                          
                          <center>
                            <a href="${feedbackUrl}" class="button">Share Your Feedback</a>
                          </center>
                          
                          <p><strong>As a thank you</strong>, everyone who completes the survey will be entered to win one of three $50 Amazon gift cards! 🎁</p>
                          
                          <p>Thank you for helping us build a better learning experience!</p>
                          
                          <p>Best regards,<br>
                          The Tuterra Team</p>
                        </div>
                        <div class="footer">
                          <p>This email was sent because you consented to feedback collection when signing up with the FIRST30 promo code.</p>
                          <p>© ${new Date().getFullYear()} Tuterra. All rights reserved.</p>
                        </div>
                      </div>
                    </body>
                  </html>
                `,
              },
            ],
          };

          sendgridResponse = await fetch(SENDGRID_BASE, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });

          if (sendgridResponse.ok) {
            success = true;
            break;
          } else {
            let errorDetails;
            try {
              errorDetails = await sendgridResponse.json();
            } catch (e) {
              errorDetails = await sendgridResponse.text();
            }
            lastError = `SendGrid error (${sendgridResponse.status}): ${JSON.stringify(errorDetails)}`;
            console.error(`[FeedbackEmail] Attempt ${attempts + 1} failed for ${email}:`, lastError);
          }
        } catch (err) {
          lastError = err?.message || String(err);
          console.error(`[FeedbackEmail] Attempt ${attempts + 1} exception for ${email}:`, lastError);
        }
        attempts++;
        await new Promise((r) => setTimeout(r, Math.pow(2, attempts) * 1000)); // Exponential backoff
      }

      // Log the email attempt
      await logEmailAttempt({
        userId: reminder.user_id,
        success,
        error: success ? undefined : lastError,
      });

      if (success) {
        // Mark reminder as sent
        await adminClient
          .from('promotional_feedback_reminders')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', reminder.id);

        // Update profile
        await adminClient
          .from('profiles')
          .update({
            feedback_email_sent: true,
            feedback_email_sent_at: new Date().toISOString()
          })
          .eq('id', reminder.user_id);

        results.push({ success: true, email, reminder_id: reminder.id });
        console.log(`[FeedbackEmail] ✅ Sent to ${email}`);
      } else {
        results.push({ success: false, email, error: lastError });
        console.error(`[FeedbackEmail] ❌ Failed to send to ${email} after ${MAX_RETRIES} attempts`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('[FeedbackEmail] Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
