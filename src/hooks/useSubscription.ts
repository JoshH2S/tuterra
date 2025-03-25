
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
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const tier = (data?.subscription_tier || "free") as SubscriptionTier;
        
        // Set features based on tier
        setSubscription({
          tier,
          features: {
            smartNotes: tier === "premium",
            advancedModel: tier !== "free",
            learningPath: tier !== "free",
            streaming: tier !== "free"
          }
        });
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
