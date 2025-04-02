
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: "pro" | "premium";
}

export const SubscriptionGuard = ({ 
  children, 
  requiredTier 
}: SubscriptionGuardProps) => {
  const { subscription, loading } = useSubscription();
  
  // Show loading state while checking subscription
  if (loading) {
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
