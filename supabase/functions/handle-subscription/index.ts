
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

  // Securely verify stripe signature
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
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

        // Retrieve subscription details from Stripe
        let subscription: any = null;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
        } else {
          logStep("Unable to retrieve subscription id for session", { sessionId: session.id });
        }

        // Determine plan ID and tier from Stripe subscription/pricing
        const planId = subscription?.metadata?.plan_id ||
          (subscription?.items?.data?.[0]?.plan?.nickname === "Pro Plan" ? "pro_plan" : "premium_plan");
        const priceId = subscription?.items?.data?.[0]?.price?.id;
        let tier = "pro";
        if (planId && planId.includes("premium")) tier = "premium";

        // Upsert subscription row
        if (userId && subscription && customerId) {
          const { error: subError } = await supabaseClient
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_id: planId,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            });
          if (subError) {
            logStep("Error upserting subscription on checkout.session.completed", { subError });
          } else {
            logStep("Upserted subscription row");
          }

          // Update user profile tier
          const { error: profileError } = await supabaseClient
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId);
          if (profileError) {
            logStep("Error updating user profile tier on checkout.session.completed", { profileError });
          }
        } else {
          logStep("Missing userId, customerId, or subscription; could not upsert");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        logStep(`${event.type} received`);
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;
        const planId = subscription.metadata.plan_id ||
          (subscription.items.data[0]?.plan?.nickname === "Pro Plan" ? "pro_plan" : "premium_plan");
        const priceId = subscription.items.data[0]?.price?.id;
        let tier = "pro";
        if (planId && planId.includes("premium")) tier = "premium";

        logStep("Updating DB from subscription event", { userId, planId, status: subscription.status });

        if (userId) {
          // Upsert subscription table
          const { error: subError } = await supabaseClient
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_id: planId,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            });
          if (subError) {
            logStep("Error upserting subscription on created/updated", { subError });
          } else {
            logStep("Upserted subscription row (created/updated)");
          }

          // Update profile tier
          const { error: profileErr } = await supabaseClient
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId);
          if (profileErr) {
            logStep("Error updating profile tier on created/updated", { profileErr });
          }
        } else {
          logStep("No userId found in subscription event", { subPayload: subscription });
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
