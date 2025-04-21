
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
  
  // Validate authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error("[WelcomeEmail] Missing or invalid authorization header");
    return new Response(JSON.stringify({ 
      error: "Unauthorized",
      details: "Valid authorization header is required" 
    }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      console.error("[WelcomeEmail] Missing email address");
      return new Response(JSON.stringify({ error: "Missing email", details: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID) {
      console.error("[WelcomeEmail] Missing SendGrid credentials");
      return new Response(JSON.stringify({ 
        error: "Configuration error", 
        details: "SendGrid API key or template ID is missing" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Make sure to use a verified sender email from your SendGrid account
    // This should match what's verified in your SendGrid dashboard
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
        email: "admin@tuterra.ai", // Updated to match verified sender in SendGrid
        name: "Tuterra",
      },
      template_id: SENDGRID_TEMPLATE_ID,
    };

    console.log(`[WelcomeEmail] Attempting to send welcome email to ${email} with template ${SENDGRID_TEMPLATE_ID}`);

    const apiRes = await fetch(SENDGRID_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!apiRes.ok) {
      let errorDetails;
      try {
        errorDetails = await apiRes.json();
      } catch (e) {
        errorDetails = await apiRes.text();
      }
      
      console.error(`[WelcomeEmail] SendGrid error (${apiRes.status}):`, errorDetails);
      return new Response(JSON.stringify({ 
        error: "SendGrid error", 
        status: apiRes.status,
        details: errorDetails 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[WelcomeEmail] Successfully sent welcome email to ${email}`);
    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[WelcomeEmail] Error:", err);
    return new Response(JSON.stringify({ error: "Internal error", details: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
