
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

// Helper function for debugging logs
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

export interface StripeSubscriptionData {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export async function getStripeSubscriptionData(
  stripe: Stripe,
  sessionId: string | undefined
): Promise<StripeSubscriptionData | null> {
  if (!sessionId) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved checkout session", { 
      sessionId, 
      customerId: session.customer,
      subscriptionId: session.subscription
    });

    if (!session.customer || !session.subscription || 
        typeof session.customer !== 'string' || 
        typeof session.subscription !== 'string') {
      return null;
    }

    return {
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription
    };
  } catch (err) {
    logStep("Error retrieving checkout session", { error: err.message });
    return null;
  }
}

export async function updateSubscriptionStatus(
  stripe: Stripe,
  subscriptionId: string,
  customerId: string,
  userId: string,
  supabaseAdmin: any
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    logStep("Retrieved subscription", { 
      id: subscription.id, 
      status: subscription.status
    });

    // Use the handle_user_subscription function to update subscription state
    const { error: updateError } = await supabaseAdmin.rpc('handle_user_subscription', {
      p_user_id: userId,
      p_stripe_subscription_id: subscription.id,
      p_stripe_customer_id: customerId,
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
    return {
      success: true,
      subscription_status: subscription.status,
      plan_id: subscription.metadata.plan_id || 'pro_plan'
    };
  } catch (err) {
    logStep("Error retrieving subscription from Stripe", { error: err.message });
    throw err;
  }
}
