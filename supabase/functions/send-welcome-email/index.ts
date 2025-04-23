
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the full supabase-js client for logging into the DB
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const SENDGRID_TEMPLATE_ID = Deno.env.get("SENDGRID_TEMPLATE_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SENDGRID_BASE = "https://api.sendgrid.com/v3/mail/send";

// Create a Supabase client with admin/service role for logging
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
        email_type: "welcome",
        success,
        error_message: error ?? null,
        // timestamp inserted automatically by DB default
      },
    ]);
  } catch (err) {
    console.error("[WelcomeEmail] Failed to log email attempt:", err?.message ?? err);
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        details: "Valid bearer Authorization header required",
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Missing email",
          details: "Email is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID) {
      return new Response(
        JSON.stringify({
          error: "Configuration error",
          details: "SendGrid API key or template ID is missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to find the user id in profiles based on email for logging
    let userId: string | undefined;
    try {
      const { data, error } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
      if (error) {
        console.error("[WelcomeEmail] Could not fetch profiles for logging:", error.message);
      } else {
        userId = data?.id;
      }
    } catch (err) {
      console.error("[WelcomeEmail] Exception in profile lookup:", err);
    }
    if (!userId) userId = null; // fail-safe, logs can still be written with user_id=null

    // Set up retry logic for sending the email
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
              dynamic_template_data: {
                firstName: firstName || "",
              },
            },
          ],
          from: {
            email: "admin@tuterra.ai",
            name: "Tuterra",
          },
          template_id: SENDGRID_TEMPLATE_ID,
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
          console.error(`[WelcomeEmail] Attempt ${attempts+1} failed:`, lastError);
        }
      } catch (err) {
        lastError = err?.message || String(err);
        console.error(`[WelcomeEmail] Attempt ${attempts+1} exception:`, lastError);
      }
      attempts++;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempts) * 1000));
    }

    // Log the attempt (always log)
    await logEmailAttempt({
      userId: userId ?? "00000000-0000-0000-0000-000000000000",
      success,
      error: success ? undefined : lastError,
    });

    if (!success) {
      return new Response(
        JSON.stringify({
          error: "SendGrid error",
          status: sendgridResponse?.status ?? 500,
          details: lastError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optionally: mark profile as emailed here (can handle in app too, not function)
    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[WelcomeEmail] Error (outer catch):", err);
    // Log severe error if userId is available
    let userId = null;
    try {
      const { email } = await req.json();
      const { data } = await adminClient.from("profiles").select("id").eq("email", email).single();
      userId = data?.id;
    } catch (_) {}
    await logEmailAttempt({
      userId: userId || "00000000-0000-0000-0000-000000000000",
      success: false,
      error: err?.message ?? String(err),
    });
    return new Response(
      JSON.stringify({
        error: "Internal error",
        details: err?.message ?? String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
