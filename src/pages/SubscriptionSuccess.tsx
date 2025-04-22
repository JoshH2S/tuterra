
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { subscription, loading: subscriptionLoading, refetch } = useSubscription();
  const [syncing, setSyncing] = useState(true);
  const [syncAttempt, setSyncAttempt] = useState(1);
  const [maxAttempts] = useState(5);
  const { toast } = useToast();
  
  const handleManualRefresh = async () => {
    setSyncing(true);
    await refetch();
    setSyncing(false);
  };
  
  // Force sync subscription status with retries
  useEffect(() => {
    const syncSubscriptionStatus = async () => {
      try {
        setSyncing(true);
        setSyncAttempt(1);
        
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          await attemptSync(sessionId, 1);
        } else {
          // If no session ID, just do a regular refetch
          await refetch();
          setSyncing(false);
        }
      } catch (error) {
        console.error("Error syncing subscription status:", error);
        setSyncing(false);
      }
    };
    
    syncSubscriptionStatus();
  }, []);
  
  const attemptSync = async (sessionId: string, attempt: number) => {
    if (attempt > maxAttempts) {
      console.warn(`Max sync attempts (${maxAttempts}) reached`);
      setSyncing(false);
      return;
    }
    
    try {
      console.log(`Sync attempt ${attempt} of ${maxAttempts}`);
      setSyncAttempt(attempt);
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: { sessionId }
      });
      
      if (error) throw error;
      console.log("Subscription check result:", data);
      
      // Refetch subscription data to update UI
      await refetch();
      
      if (subscription.tier === 'free') {
        console.warn("Subscription tier still showing as free, will retry");
        // Wait with exponential backoff before retrying
        const delay = Math.min(2000 * Math.pow(1.5, attempt), 10000);
        console.log(`Waiting ${delay}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptSync(sessionId, attempt + 1);
      } else {
        console.log(`Subscription verified as ${subscription.tier}`);
        setSyncing(false);
      }
    } catch (error) {
      console.error(`Sync attempt ${attempt} failed:`, error);
      if (attempt < maxAttempts) {
        const delay = Math.min(2000 * Math.pow(1.5, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptSync(sessionId, attempt + 1);
      } else {
        setSyncing(false);
      }
    }
  };

  // Validate that subscription is active
  useEffect(() => {
    if (!subscriptionLoading && !syncing && subscription.tier === 'free') {
      toast({
        title: "Subscription Issue",
        description: "Your subscription doesn't appear to be active yet. This might take a few moments to update.",
        variant: "destructive"
      });
    }
  }, [subscriptionLoading, syncing, subscription, toast]);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[70vh] w-full max-w-full">
      <div className="bg-background rounded-lg shadow-sm border p-6 sm:p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-emerald-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Subscription Successful!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Thank you for subscribing! Your account has been upgraded and you now have access to all premium features.
        </p>
        
        {(subscriptionLoading || syncing) ? (
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center mb-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Finalizing your subscription...</span>
            </div>
            {syncAttempt > 1 && (
              <p className="text-xs text-muted-foreground">
                Sync attempt {syncAttempt} of {maxAttempts}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="text-sm bg-muted/50 rounded p-3">
              <p>Current subscription: <span className="font-medium">{subscription.tier === 'pro' ? 'Pro' : subscription.tier === 'premium' ? 'Premium' : 'Free'}</span></p>
              {subscription.status && (
                <p className="text-xs mt-1">Status: <span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span></p>
              )}
              {subscription.tier === 'free' && (
                <div className="mt-3">
                  <p className="text-amber-600 mb-2 text-xs">
                    If your subscription doesn't appear active, please try refreshing:
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleManualRefresh}
                    className="w-full flex items-center justify-center"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh Subscription Status
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile-settings')}
            className="w-full sm:w-auto"
          >
            Manage Subscription
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
