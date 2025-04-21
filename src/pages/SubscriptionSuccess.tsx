
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { subscription, loading } = useSubscription();
  const [syncing, setSyncing] = useState(true);
  const { toast } = useToast();
  
  // Force sync subscription status
  useEffect(() => {
    const syncSubscriptionStatus = async () => {
      try {
        setSyncing(true);
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          await supabase.functions.invoke('check-subscription-status', {
            body: { sessionId }
          });
          console.log("Subscription status synced after checkout completion");
        }
      } catch (error) {
        console.error("Error syncing subscription status:", error);
      } finally {
        setSyncing(false);
      }
    };
    
    syncSubscriptionStatus();
  }, []);

  // Validate that subscription is active
  useEffect(() => {
    if (!loading && !syncing && subscription.tier === 'free') {
      toast({
        title: "Subscription Issue",
        description: "Your subscription doesn't appear to be active yet. This might take a few moments to update.",
        variant: "destructive"
      });
    }
  }, [loading, syncing, subscription, toast]);

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
        
        {(loading || syncing) ? (
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Finalizing your subscription...</span>
          </div>
        ) : (
          <div className="text-sm bg-muted/50 rounded p-2 mb-6">
            <p>Current subscription: <span className="font-medium">{subscription.tier === 'pro' ? 'Pro' : subscription.tier === 'premium' ? 'Premium' : 'Free'}</span></p>
            {subscription.tier === 'free' && (
              <p className="text-amber-600 mt-1 text-xs">
                If your subscription doesn't appear active, please refresh the page in a few moments.
              </p>
            )}
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
