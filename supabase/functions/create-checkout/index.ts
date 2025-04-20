
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to log steps for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Error: No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the JWT token from the authorization header
    const token = authHeader.replace("Bearer ", "");
    logStep("Got authorization token");
    
    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      logStep("Error: Invalid user token", { error: userError });
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    logStep("Authenticated user", { userId: user.id, email: user.email });

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Parsed request body", requestBody);
    } catch (e) {
      logStep("Error parsing request body", { error: e.message });
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { planId, successUrl, cancelUrl } = requestBody;

    if (!planId || !successUrl || !cancelUrl) {
      logStep("Error: Missing required parameters", { planId, successUrl, cancelUrl });
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate URLs
    try {
      const origin = req.headers.get("origin") || "";
      if (!successUrl.startsWith("http") || !cancelUrl.startsWith("http")) {
        logStep("Error: Invalid URLs", { successUrl, cancelUrl });
        return new Response(
          JSON.stringify({ error: "Invalid success or cancel URLs format" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      logStep("Error validating URLs", { error: error.message });
      return new Response(
        JSON.stringify({ error: "URL validation failed: " + error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Stripe key from environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Error: Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Stripe key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    logStep("Initialized Stripe");

    // Check if the user already has a Stripe customer ID
    const { data: subscriptionData } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = subscriptionData?.stripe_customer_id;
    logStep("Checked for existing customer", { customerId });

    // If not, create a new customer
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
        logStep("Created new Stripe customer", { customerId });
        
        // Store the customer ID in the subscriptions table
        const { error: insertError } = await supabaseClient
          .from("subscriptions")
          .insert({
            user_id: user.id,
            stripe_customer_id: customerId,
            status: 'incomplete',
            plan_id: planId
          });

        if (insertError) {
          logStep("Error storing customer ID", { error: insertError });
          // Don't throw, just log - this isn't critical for checkout
        }
      } catch (error) {
        logStep("Error creating Stripe customer", { error: error.message });
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe customer: ${error.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Get price ID from environment variable
    const priceId = Deno.env.get("STRIPE_PRO_PLAN_PRICE_ID");
    if (!priceId) {
      logStep("Error: Missing price ID configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing price ID" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Define price IDs for each plan - use environment variables if available
    // Otherwise fall back to the hardcoded values for backward compatibility
    const priceIds: Record<string, string> = {
      pro_plan: Deno.env.get("STRIPE_PRO_PLAN_PRICE_ID") || "price_1OYkJIEgy9SNKabWXygbnoMf",
    };

    // Validate plan ID is supported
    if (!priceIds[planId]) {
      logStep("Error: Invalid plan ID", { planId, availablePlans: Object.keys(priceIds) });
      return new Response(
        JSON.stringify({ error: `Invalid plan ID: ${planId}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate the price exists and is active
    try {
      logStep("Validating price", { priceId: priceIds[planId] });
      const price = await stripe.prices.retrieve(priceIds[planId]);
      if (!price.active) {
        logStep("Error: Price is not active", { priceId: priceIds[planId] });
        return new Response(
          JSON.stringify({ error: "Selected plan is not currently available" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      logStep("Price validated successfully", { priceId: priceIds[planId], active: price.active });
    } catch (error) {
      logStep("Error validating price", { error: error.message, priceId: priceIds[planId] });
      return new Response(
        JSON.stringify({ error: "Invalid price configuration: " + error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a checkout session
    try {
      logStep("Creating checkout session", { 
        customer: customerId, 
        priceId: priceIds[planId],
        successUrl,
        cancelUrl,
        userEmail: user.email,
        userId: user.id
      });
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceIds[planId],
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_id: planId,
          },
        },
        payment_method_types: ['card'],
        allow_promotion_codes: true,
      });

      // Log the session details (excluding sensitive data)
      logStep("Checkout session created", { 
        sessionId: session.id, 
        url: session.url,
        status: session.status,
        mode: session.mode,
        paymentStatus: session.payment_status
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      logStep("Error creating checkout session", { 
        error: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param
      });
      
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          type: error.type,
          code: error.code
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logStep("Unexpected error", { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
