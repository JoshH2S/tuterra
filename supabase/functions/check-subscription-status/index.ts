
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    let requestBody;
    try {
      requestBody = await req.json();
      logStep("Parsed request body", requestBody);
    } catch (e) {
      logStep("Error parsing request body", { error: e.message });
      throw new Error("Invalid request body");
    }

    const { sessionId } = requestBody;

    const { data: subscriptionData } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

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

        if (session.customer && typeof session.customer === 'string') {
          stripeCustomerId = session.customer;
        }

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
          status: subscription.status
        });

        // Use the handle_user_subscription function to update subscription state
        const { error: updateError } = await supabaseAdmin.rpc('handle_user_subscription', {
          p_user_id: user.id,
          p_stripe_subscription_id: subscription.id,
          p_stripe_customer_id: stripeCustomerId,
          p_plan_id: subscription.metadata.plan_id || 'pro_plan',
          p_status: subscription.status,
          p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          p_cancel_at_period_end: subscription.cancel_at_period_end
        });

        if (updateError) {
          logStep("Error updating subscription status", { error: updateError });
          throw updateError;
        }

        logStep("Successfully updated subscription status");
        return new Response(JSON.stringify({ 
          success: true,
          subscription_status: subscription.status,
          plan_id: subscription.metadata.plan_id || 'pro_plan'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (err) {
        logStep("Error retrieving subscription from Stripe", { error: err.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      message: "Could not update subscription status" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Unexpected error", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
