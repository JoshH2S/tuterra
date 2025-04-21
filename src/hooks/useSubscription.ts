
import { useState, useEffect, useCallback } from "react";
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

// Define custom interface for subscription data
interface SubscriptionData {
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
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
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchSubscription = useCallback(async (force = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    // If it's been less than 5 seconds since the last fetch and not forced, skip
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      console.log("Skipping subscription fetch - too soon since last fetch");
      return;
    }

    setLoading(true);
    setLastFetchTime(now);

    try {
      console.log("Fetching subscription data...");
      
      // Get subscription tier from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      const tier = (profileData?.subscription_tier || "free") as SubscriptionTier;
      console.log("Fetched profile tier:", tier);
      
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
        // Type assert the data to our interface
        const typedData = subscriptionData as unknown as SubscriptionData;
        
        subscriptionInfo.planId = typedData.plan_id;
        subscriptionInfo.status = typedData.status;
        subscriptionInfo.currentPeriodEnd = typedData.current_period_end;
        subscriptionInfo.cancelAtPeriodEnd = typedData.cancel_at_period_end;
        subscriptionInfo.stripeCustomerId = typedData.stripe_customer_id;
        subscriptionInfo.stripeSubscriptionId = typedData.stripe_subscription_id;
        
        console.log("Fetched subscription details:", {
          planId: typedData.plan_id,
          status: typedData.status
        });
      }

      setSubscription(subscriptionInfo);
      console.log("Subscription data updated", subscriptionInfo);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [user, lastFetchTime]);

  // Function to force a refresh of subscription data
  const refetch = useCallback(() => {
    return fetchSubscription(true);
  }, [fetchSubscription]);

  // Fetch on initial load
  useEffect(() => {
    fetchSubscription();
  }, [user, fetchSubscription]);

  return { subscription, loading, refetch };
};
