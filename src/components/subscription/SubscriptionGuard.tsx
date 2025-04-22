
import React, { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier: "pro" | "premium";
}

export const SubscriptionGuard = ({ 
  children, 
  requiredTier 
}: SubscriptionGuardProps) => {
  // Move all hooks to the top
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const [isReady, setIsReady] = useState(false);
  
  // Handle async loading states with useEffect
  useEffect(() => {
    // Only set ready when both auth and subscription loading are complete
    if (!authLoading && !subLoading) {
      setIsReady(true);
    }
  }, [authLoading, subLoading]);
  
  // Show loading state until everything is ready
  if (!isReady || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Compute access after all hooks and loading states are resolved
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
