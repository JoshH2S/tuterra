
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "pro" | "premium";

export interface Subscription {
  id?: string;
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

const getFeaturesByTier = (tier: SubscriptionTier) => {
  switch (tier) {
    case "pro":
    case "premium":
      return {
        smartNotes: true,
        advancedModel: true,
        learningPath: true,
        streaming: true,
      };
    case "free":
    default:
      return {
        smartNotes: false,
        advancedModel: false,
        learningPath: false,
        streaming: false,
      };
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>({
    tier: "free",
    features: getFeaturesByTier("free"),
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({
        tier: "free",
        features: getFeaturesByTier("free"),
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, get subscription tier from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile subscription tier:', profileError);
        throw profileError;
      }

      const tier = (profile?.subscription_tier as SubscriptionTier) || "free";
      
      // Then get additional subscription details from subscriptions table if available
      const { data: stripeSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setSubscription({
        tier,
        features: getFeaturesByTier(tier),
        planId: stripeSubscription?.plan_id,
        status: stripeSubscription?.status,
        currentPeriodEnd: stripeSubscription?.current_period_end,
        cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end,
        stripeCustomerId: stripeSubscription?.stripe_customer_id,
        stripeSubscriptionId: stripeSubscription?.stripe_subscription_id,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Fallback to free tier on error
      setSubscription({
        tier: "free",
        features: getFeaturesByTier("free"),
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const syncWithStripe = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: { sessionId: null }
      });
      
      if (error) {
        console.error('Error syncing with Stripe:', error);
        return;
      }
      
      // Refetch subscription after sync
      await fetchSubscription();
    } catch (error) {
      console.error('Error syncing subscription with Stripe:', error);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { 
    subscription, 
    loading, 
    refetch: fetchSubscription,
    syncWithStripe 
  };
};
