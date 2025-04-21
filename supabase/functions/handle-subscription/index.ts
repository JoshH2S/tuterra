
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: log step with details to edge logs
const logStep = (step: string, details?: unknown) => {
  const msg = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK] ${step}${msg}`);
};

// Helper function to determine plan ID from subscription
const determinePlanId = (subscription: Stripe.Subscription) => {
  // First check metadata
  if (subscription.metadata?.plan_id) {
    logStep("Found plan_id in metadata", { plan_id: subscription.metadata.plan_id });
    return subscription.metadata.plan_id;
  }
  
  // Then check plan nickname
  const planNickname = subscription.items?.data[0]?.plan?.nickname?.toLowerCase() || '';
  logStep("Checking plan nickname", { planNickname });
  
  if (planNickname.includes('pro')) {
    return 'pro_plan';
  }
  if (planNickname.includes('premium')) {
    return 'premium_plan';
  }
  
  // Default to pro_plan if we can't determine
  logStep("Could not determine plan from metadata or nickname, defaulting to pro_plan");
  return 'pro_plan';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Stripe and Supabase
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });

  // Use service role for DB writes
  const supabaseClient = createClient(
    supabaseUrl,
    supabaseServiceKey
  );

  let event;
  const sig = req.headers.get("stripe-signature") || "";
  const payload = await req.text();

  // Securely verify stripe signature - using the async version
  try {
    // Important: Use constructEventAsync instead of constructEvent
    event = await stripe.webhooks.constructEventAsync(payload, sig, webhookSecret);
    logStep("Webhook event constructed", { type: event.type });
  } catch (err) {
    logStep("Invalid Stripe signature", { error: err instanceof Error ? err.message : err });
    return new Response(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        logStep("checkout.session.completed received");
        const session = event.data.object;
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        const userId = session.metadata?.user_id || session.client_reference_id;
        
        logStep("Session complete", {
          userId,
          customerId,
          subscriptionId,
          email: session.customer_email,
        });

        if (!userId) {
          throw new Error('No user ID found in session metadata');
        }

        // Retrieve subscription details from Stripe
        let subscription: any = null;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
          logStep("Retrieved subscription details", { 
            status: subscription.status,
            items: subscription.items.data.length,
            planNickname: subscription.items.data[0]?.plan?.nickname
          });
        }

        if (subscription && customerId) {
          const { error } = await supabaseClient.rpc('handle_user_subscription', {
            p_user_id: userId,
            p_stripe_subscription_id: subscription.id,
            p_stripe_customer_id: customerId,
            p_plan_id: subscription.metadata.plan_id || 'pro_plan',
            p_status: subscription.status,
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            p_cancel_at_period_end: subscription.cancel_at_period_end
          });

          if (error) {
            logStep("Error updating subscription status", { error });
            throw error;
          }
          
          logStep("Successfully updated subscription status");
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        logStep(`${event.type} received`);
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        if (userId) {
          const { error } = await supabaseClient.rpc('handle_user_subscription', {
            p_user_id: userId,
            p_stripe_subscription_id: subscription.id,
            p_stripe_customer_id: subscription.customer,
            p_plan_id: subscription.metadata.plan_id || 'pro_plan',
            p_status: subscription.status,
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            p_cancel_at_period_end: subscription.cancel_at_period_end
          });

          if (error) {
            logStep("Error updating subscription status", { error });
            throw error;
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        logStep("customer.subscription.deleted received");
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        // Update subscription status to canceled
        if (userId) {
          const { error: subError } = await supabaseClient
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);
          if (subError) {
            logStep("Error updating subscription to canceled", { subError });
          } else {
            logStep("Marked subscription as canceled");
          }

          // Reset profile tier to free
          const { error: resetError } = await supabaseClient
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", userId);
          if (resetError) {
            logStep("Error resetting profile tier on deleted", { resetError });
          } else {
            logStep("Successfully reset profile tier to free (deleted)");
          }
        } else {
          logStep("No userId found for subscription.deleted event");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    logStep("Webhook processing error", { err: err instanceof Error ? err.message : err, stack: err && err.stack });
    return new Response(
      JSON.stringify({ error: "Webhook error processing event: " + (err && err.message ? err.message : String(err)) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
