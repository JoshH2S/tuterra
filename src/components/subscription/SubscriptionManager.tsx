
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionManagerProps {
  className?: string;
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { 
    subscription, 
    subscriptionLoading, 
    cancelSubscription, 
    reactivateSubscription,
    createBillingPortalSession,
    loading 
  } = useSubscriptionManagement();
  
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const isMobile = useIsMobile();

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription || subscription.tier === "free") {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No active subscription</AlertTitle>
          <AlertDescription>
            You currently don't have an active subscription. Upgrade to access premium features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentPeriodEnd = subscription.currentPeriodEnd 
    ? format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')
    : 'N/A';
  
  const planName = 
    subscription.planId === 'pro_plan' ? 'Pro Plan' : 
    subscription.planId === 'premium_plan' ? 'Premium Plan' : 
    'Unknown Plan';

  const handleOpenBillingPortal = async () => {
    await createBillingPortalSession(window.location.origin + '/profile-settings');
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setConfirmCancelOpen(false);
    }
  };

  const handleReactivateSubscription = async () => {
    await reactivateSubscription();
  };

  return (
    <div className={className}>
      <Card className="border-0 shadow-sm bg-gradient-to-b from-background to-muted/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your plan and billing information</CardDescription>
            </div>
            <Badge
              variant={subscription.status === 'active' ? 'default' : 'destructive'}
              className="h-7 px-3"
            >
              {subscription.status === 'active' 
                ? subscription.cancelAtPeriodEnd 
                  ? 'Canceling' 
                  : 'Active'
                : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Plan</h3>
              <p className="font-semibold">{planName}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing Date'}
              </h3>
              <p className="font-semibold">{currentPeriodEnd}</p>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30">
              <AlertTitle className="font-medium">Subscription Canceling</AlertTitle>
              <AlertDescription>
                Your subscription has been canceled and will end on {currentPeriodEnd}. 
                You'll lose access to premium features after this date.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2"
            onClick={handleOpenBillingPortal}
            disabled={loading}
          >
            <CreditCard className="h-4 w-4" />
            {isMobile ? "Billing Portal" : "Manage Payment Methods"}
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
          </Button>

          {subscription.cancelAtPeriodEnd ? (
            <Button
              className="w-full sm:w-auto"
              onClick={handleReactivateSubscription}
              disabled={loading}
            >
              Reactivate Subscription
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
            </Button>
          ) : (
            <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel your subscription? You'll continue to have access to premium features until {currentPeriodEnd}.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmCancelOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Keep Subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Yes, Cancel
                    {loading && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
