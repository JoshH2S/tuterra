
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
const SENDGRID_TEMPLATE_ID = Deno.env.get("SENDGRID_TEMPLATE_ID")!;

const SENDGRID_BASE = "https://api.sendgrid.com/v3/mail/send";

/**
 * Body should be { email: string, firstName: string }
 */
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      console.error("[WelcomeEmail] Missing email address");
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID) {
      console.error("[WelcomeEmail] Missing SendGrid credentials");
      return new Response(JSON.stringify({ error: "Missing SendGrid config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
        email: "noreply@tuterra.co", // <-- Update this to match your verified sender
        name: "Tuterra",
      },
      template_id: SENDGRID_TEMPLATE_ID,
    };

    const apiRes = await fetch(SENDGRID_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("[WelcomeEmail] SendGrid error", errorText);
      return new Response(JSON.stringify({ error: "SendGrid error", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[WelcomeEmail] Sent welcome email to ${email}`);
    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[WelcomeEmail] Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
