
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Invalid user token");
    }
    
    logStep("Authenticated user", { userId: user.id, email: user.email });

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
      throw new Error("Invalid request body");
    }

    const { action } = requestBody;
    if (!action) {
      throw new Error("Missing action parameter");
    }

    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscriptionData?.stripe_subscription_id) {
      throw new Error("Could not retrieve subscription information");
    }

    const { stripe_subscription_id, stripe_customer_id } = subscriptionData;

    try {
      let subscription;
      if (action === 'cancel') {
        logStep("Cancelling subscription", { subscriptionId: stripe_subscription_id });
        subscription = await stripe.subscriptions.update(
          stripe_subscription_id,
          { cancel_at_period_end: true }
        );
      } 
      else if (action === 'reactivate') {
        logStep("Reactivating subscription", { subscriptionId: stripe_subscription_id });
        subscription = await stripe.subscriptions.update(
          stripe_subscription_id,
          { cancel_at_period_end: false }
        );
      }
      else {
        throw new Error("Invalid action");
      }

      // Use handle_user_subscription to update the status
      const { error: updateError } = await supabaseClient.rpc('handle_user_subscription', {
        p_user_id: user.id,
        p_stripe_subscription_id: subscription.id,
        p_stripe_customer_id: stripe_customer_id,
        p_plan_id: subscription.metadata.plan_id || 'pro_plan',
        p_status: subscription.status,
        p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        p_cancel_at_period_end: subscription.cancel_at_period_end
      });

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, data: subscription }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      logStep("Error managing subscription", { error: error.message });
      throw error;
    }
  } catch (error) {
    logStep("Unexpected error", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
