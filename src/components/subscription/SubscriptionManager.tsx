
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Info, CreditCard } from "lucide-react";
import { formatDate } from "@/utils/date-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface SubscriptionManagerProps {
  className?: string;
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  // Always define hooks at the top level
  const { 
    subscription, 
    loading, 
    cancelSubscription, 
    reactivateSubscription,
    createBillingPortalSession 
  } = useSubscriptionManagement();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Define handlers
  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      setActionLoading("cancel");
      await cancelSubscription();
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading("reactivate");
    await reactivateSubscription();
    setActionLoading(null);
  };

  const handleBillingPortal = async () => {
    setActionLoading("billing");
    await createBillingPortalSession(window.location.origin + "/profile-settings");
    setActionLoading(null);
  };

  // Create local variables to decide what to render
  const isFreeTier = subscription.tier === "free" || !subscription.status;
  
  // Always return a component, don't use conditional returns for different types
  return (
    <Card className={cn("w-full", className)}>
      {loading ? (
        // Loading state
        <>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Loading your subscription details...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </>
      ) : isFreeTier ? (
        // Free tier display
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription</CardTitle>
              <SubscriptionBadge tier={subscription.tier} />
            </div>
            <CardDescription>You are currently on the free plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Upgrade to unlock premium features like AI-powered notes, advanced question generation, and more.
            </p>
            <Button onClick={() => window.location.href = "/pricing"} className="w-full">
              Upgrade Now
            </Button>
          </CardContent>
        </>
      ) : (
        // Paid tier display
        <>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription</CardTitle>
              <SubscriptionBadge tier={subscription.tier} />
            </div>
            <CardDescription>
              Manage your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription Status */}
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Status</div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    "font-normal",
                    subscription.status === "active" ? "text-emerald-500 border-emerald-200 bg-emerald-50" :
                    subscription.status === "trialing" ? "text-blue-500 border-blue-200 bg-blue-50" :
                    "text-amber-500 border-amber-200 bg-amber-50"
                  )}
                >
                  {subscription.status === "active" ? "Active" : 
                   subscription.status === "trialing" ? "Trial" : 
                   subscription.status === "past_due" ? "Past Due" : 
                   subscription.status === "incomplete" ? "Incomplete" : 
                   "Inactive"}
                </Badge>
                
                {subscription.cancelAtPeriodEnd && (
                  <Badge 
                    variant="outline"
                    className="font-normal text-gray-500 border-gray-200 bg-gray-50"
                  >
                    Cancels at period end
                  </Badge>
                )}
              </div>
            </div>

            {/* Billing Period */}
            {subscription.currentPeriodEnd && (
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">Current period ends</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(new Date(subscription.currentPeriodEnd))}
                </div>
              </div>
            )}

            {/* Cancellation Info */}
            {subscription.cancelAtPeriodEnd && (
              <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Subscription Canceled</AlertTitle>
                <AlertDescription>
                  Your subscription has been canceled but you'll still have access to premium features until the end of your billing period.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBillingPortal}
              disabled={actionLoading === "billing"}
            >
              {actionLoading === "billing" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Manage Billing
                </span>
              )}
            </Button>
            
            {!subscription.cancelAtPeriodEnd && subscription.status === "active" && (
              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleCancelSubscription}
                disabled={actionLoading === "cancel"}
              >
                {actionLoading === "cancel" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            )}
            
            {subscription.cancelAtPeriodEnd && (
              <Button
                variant="default"
                className="w-full"
                onClick={handleReactivateSubscription}
                disabled={actionLoading === "reactivate"}
              >
                {actionLoading === "reactivate" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Reactivate Subscription"
                )}
              </Button>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
