
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth"; // Add this
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: "pro" | "premium";
}

export const SubscriptionGuard = ({ 
  children, 
  requiredTier 
}: SubscriptionGuardProps) => {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  const { subscription, loading: subLoading } = useSubscription();
  
  // Combined loading state - we're loading if either auth or subscription is loading
  const loading = authLoading || subLoading;

  // Show loading state if loading or if user is not yet available
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Determine if user has access based on their subscription tier
  const hasAccess = 
    (requiredTier === "pro" && (subscription.tier === "pro" || subscription.tier === "premium")) ||
    (requiredTier === "premium" && subscription.tier === "premium");
  
  if (!hasAccess) {
    return (
      <UpgradePrompt 
        isOpen={true} 
        onClose={() => {}} 
        featureType={requiredTier === "premium" ? "assessment" : "quiz"}
      />
    );
  }
  
  return <>{children}</>;
};
