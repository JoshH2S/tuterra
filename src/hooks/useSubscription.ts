
import { useState } from "react";
import { useAuth } from "./useAuth";

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

// Simplified version of useSubscription that returns a default free tier
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription] = useState<Subscription>({
    tier: "free",
    features: {
      smartNotes: false,
      advancedModel: false,
      learningPath: false,
      streaming: false,
    }
  });
  const [loading] = useState(false);

  const fetchSubscription = async () => {
    // Simplified function that does nothing
    return;
  };

  const syncWithStripe = async () => {
    // Simplified function that does nothing
    return;
  };

  return { 
    subscription, 
    loading, 
    refetch: fetchSubscription,
    syncWithStripe 
  };
};
