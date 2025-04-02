
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "pro" | "premium";

export interface Subscription {
  tier: SubscriptionTier;
  features: {
    smartNotes: boolean;
    advancedModel: boolean;
    learningPath: boolean;
    streaming: boolean;
  };
  planId?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>({
    tier: "free",
    features: {
      smartNotes: false,
      advancedModel: false,
      learningPath: false,
      streaming: false,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get subscription tier from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        const tier = (profileData?.subscription_tier || "free") as SubscriptionTier;
        
        // Get subscription details from subscriptions table
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        // Set features based on tier
        const subscriptionInfo: Subscription = {
          tier,
          features: {
            smartNotes: tier === "premium",
            advancedModel: tier !== "free",
            learningPath: tier !== "free",
            streaming: tier !== "free"
          }
        };

        // Add subscription details if available
        if (!subscriptionError && subscriptionData) {
          subscriptionInfo.planId = subscriptionData.plan_id;
          subscriptionInfo.status = subscriptionData.status;
          subscriptionInfo.currentPeriodEnd = subscriptionData.current_period_end;
          subscriptionInfo.cancelAtPeriodEnd = subscriptionData.cancel_at_period_end;
          subscriptionInfo.stripeCustomerId = subscriptionData.stripe_customer_id;
          subscriptionInfo.stripeSubscriptionId = subscriptionData.stripe_subscription_id;
        }

        setSubscription(subscriptionInfo);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  return { subscription, loading };
};
