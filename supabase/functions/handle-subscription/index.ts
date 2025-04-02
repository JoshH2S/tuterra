
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // This endpoint doesn't need authentication as it's called by Stripe
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Get the request text as a string
  const body = await req.text();
  // Get the stripe signature from the headers
  const signature = req.headers.get("stripe-signature");

  try {
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    
    // Verify the webhook signature
    // This will throw an error if the signature is invalid
    const event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      endpointSecret
    );

    // Handle the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;
        const planId = subscription.metadata.plan_id || 
                      (subscription.items.data[0].plan.nickname === "Pro Plan" ? "pro_plan" : "premium_plan");
        
        // Update or insert subscription information
        await supabaseClient
          .from("subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: planId,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .select();
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await supabaseClient
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", deletedSubscription.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
