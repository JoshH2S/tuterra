
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "pro" | "premium";

export interface Subscription {
  id?: string; // Added id property
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchSubscription = useCallback(async (force = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) {
      console.log("Skipping subscription fetch - too soon since last fetch");
      return;
    }

    setLoading(true);
    setLastFetchTime(now);

    try {
      console.log("Fetching subscription data...");
      
      // First get the subscription tier from profiles table
      // This is a database call, not an edge function, so it's more reliable
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile tier:", profileError);
        // Don't throw - continue with default free tier
      }

      const tier = (profileData?.subscription_tier || "free") as SubscriptionTier;
      console.log("Fetched profile tier:", tier);
      
      // Then get detailed subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subscriptionError) {
        console.error("Error fetching subscription details:", subscriptionError);
        // Don't throw - continue with basic subscription data
      }

      const subscriptionInfo: Subscription = {
        tier,
        features: {
          smartNotes: tier === "premium",
          advancedModel: tier !== "free",
          learningPath: tier !== "free",
          streaming: tier !== "free"
        }
      };

      if (subscriptionData) {
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
      // Don't rethrow - ensure we don't crash the app
    } finally {
      setLoading(false);
    }
  }, [user, lastFetchTime]);

  // Only call check-subscription-status when really needed and with proper error handling
  const syncWithStripe = useCallback(async (sessionId?: string) => {
    if (!user) return;
    
    try {
      console.log("Syncing subscription with Stripe", sessionId ? { sessionId } : "");
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: sessionId ? { sessionId } : {}
      });
      
      if (error) {
        console.error("Error syncing with Stripe:", error);
        return;
      }
      
      if (data?.success) {
        console.log("Successfully synced subscription with Stripe:", data);
        // Force refresh subscription data from database
        fetchSubscription(true);
      }
    } catch (err) {
      console.error("Exception in syncWithStripe:", err);
      // Don't rethrow - ensure we don't crash the app
    }
  }, [user, fetchSubscription]);

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time listeners for subscription changes
    const channel = supabase
      .channel(`profiles:subscription:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log('Profile changed:', payload);
        fetchSubscription(true);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Subscription changed:', payload);
        fetchSubscription(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscription]);

  useEffect(() => {
    // On initial load, just fetch from database, don't call edge function
    if (user) {
      fetchSubscription();
      setIsInitialLoad(false);
    }
    
    // We EXPLICITLY don't call syncWithStripe() on initial load
    // This prevents potential errors from crashing the app on page load
    // User can manually refresh or it will be called when needed from components
  }, [user, fetchSubscription]);

  return { 
    subscription, 
    loading, 
    refetch: fetchSubscription,
    syncWithStripe 
  };
};
