
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for debugging logs
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Create Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
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
    
    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

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
    
    // Parse request body
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

    const { sessionId } = requestBody;

    // Get subscription data from Supabase
    const { data: subscriptionData, error: subscriptionFetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionFetchError) {
      logStep("Error fetching subscription data", { error: subscriptionFetchError });
    }

    let stripeSubscriptionId = subscriptionData?.stripe_subscription_id;
    let stripeCustomerId = subscriptionData?.stripe_customer_id;

    // If we have a session ID, retrieve the session from Stripe
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        logStep("Retrieved checkout session", { 
          sessionId, 
          customerId: session.customer,
          subscriptionId: session.subscription
        });

        // Update customer ID if available
        if (session.customer && typeof session.customer === 'string') {
          stripeCustomerId = session.customer;
        }

        // Update subscription ID if available
        if (session.subscription && typeof session.subscription === 'string') {
          stripeSubscriptionId = session.subscription;
        }
      } catch (err) {
        logStep("Error retrieving checkout session", { error: err.message });
      }
    }

    // If we have a subscription ID, retrieve the subscription from Stripe
    if (stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        logStep("Retrieved subscription", { 
          id: subscription.id, 
          status: subscription.status,
          planId: subscription.items.data[0]?.plan?.nickname || 'unknown'
        });

        // Determine plan ID and tier from Stripe subscription
        const planId = subscription.metadata?.plan_id ||
          (subscription.items?.data[0]?.plan?.nickname === "Pro Plan" ? "pro_plan" : "premium_plan");
        
        let tier = "pro";
        if (planId && planId.includes("premium")) tier = "premium";

        // Update subscription data in Supabase
        const { error: updateSubscriptionError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: planId,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          });

        if (updateSubscriptionError) {
          logStep("Error updating subscription", { error: updateSubscriptionError });
        } else {
          logStep("Updated subscription data");
        }

        // Update profile tier directly
        const { error: updateProfileError } = await supabaseAdmin
          .from("profiles")
          .update({ subscription_tier: tier })
          .eq("id", user.id);

        if (updateProfileError) {
          logStep("Error updating profile tier", { error: updateProfileError });
        } else {
          logStep("Updated profile tier to", { tier });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            subscription_tier: tier,
            subscription_status: subscription.status
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        logStep("Error retrieving subscription from Stripe", { error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Could not update subscription status" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logStep("Unexpected error", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
