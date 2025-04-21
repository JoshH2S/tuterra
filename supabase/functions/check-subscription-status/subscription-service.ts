
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
      logStep("Missing customer or subscription in session", {
        customer: session.customer,
        subscription: session.subscription
      });
      return null;
    }

    return {
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription
    };
  } catch (err) {
    logStep("Error retrieving checkout session", { 
      error: err instanceof Error ? err.message : String(err),
      sessionId
    });
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
    logStep("Retrieving subscription from Stripe", { subscriptionId });
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    logStep("Retrieved subscription", { 
      id: subscription.id, 
      status: subscription.status,
      planId: subscription.metadata?.plan_id || 'pro_plan'
    });

    // Determine plan ID - use metadata or fall back to analyzing the product/price data
    const planId = subscription.metadata?.plan_id || determinePlanFromSubscription(subscription);
    
    logStep("Updating subscription status in database", {
      userId,
      subscriptionId,
      planId,
      status: subscription.status
    });

    // Use the handle_user_subscription function to update subscription state
    const { data, error: updateError } = await supabaseAdmin.rpc('handle_user_subscription', {
      p_user_id: userId,
      p_stripe_subscription_id: subscription.id,
      p_stripe_customer_id: customerId,
      p_plan_id: planId,
      p_status: subscription.status,
      p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      p_cancel_at_period_end: subscription.cancel_at_period_end
    });

    if (updateError) {
      logStep("Error updating subscription status", { 
        error: updateError.message,
        details: updateError.details,
        hint: updateError.hint 
      });
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    logStep("Successfully updated subscription status");
    return {
      success: true,
      subscription_status: subscription.status,
      plan_id: planId,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    };
  } catch (err) {
    logStep("Error processing subscription", { 
      error: err instanceof Error ? err.message : String(err),
      subscriptionId
    });
    throw err;
  }
}

// Helper function to determine plan ID from subscription details
function determinePlanFromSubscription(subscription: Stripe.Subscription): string {
  // First check metadata
  if (subscription.metadata?.plan_id) {
    return subscription.metadata.plan_id;
  }
  
  // Check plan nickname
  const item = subscription.items.data[0];
  if (item?.plan?.nickname) {
    const nickname = item.plan.nickname.toLowerCase();
    if (nickname.includes('premium')) return 'premium_plan';
    if (nickname.includes('pro')) return 'pro_plan';
  }
  
  // Check product name if available
  if (item?.price?.product && typeof item.price.product !== 'string') {
    const productName = item.price.product.name?.toLowerCase();
    if (productName?.includes('premium')) return 'premium_plan';
    if (productName?.includes('pro')) return 'pro_plan';
  }
  
  // Default to pro_plan if we can't determine
  logStep("Could not determine plan from subscription details, using default", {
    items: subscription.items.data.length,
    hasNickname: !!subscription.items.data[0]?.plan?.nickname
  });
  return 'pro_plan';
}
