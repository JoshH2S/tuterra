
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

const OnboardingRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [redirecting, setRedirecting] = useState(true);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const { syncWithStripe } = useSubscription();
  
  // Recursive function to retry subscription status sync with exponential backoff
  const attemptSubscriptionSync = async (sessionId: string, maxRetries = 3, attemptNum = 0) => {
    try {
      // Exponential backoff delay
      const delayMs = 1500 * Math.pow(1.5, attemptNum);
      console.log(`Attempt ${attemptNum + 1}: Waiting ${delayMs}ms before checking subscription status`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      setSyncAttempt(attemptNum + 1);
      
      // Use the syncWithStripe function from useSubscription hook
      await syncWithStripe();
      
      // Explicitly check subscription status in database
      const { data: subStatus, error } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .single();
      
      if (error) {
        console.error("Error checking subscription status:", error);
        throw new Error("Failed to verify subscription");
      }
      
      if (subStatus?.status === 'active') {
        console.log("Subscription verified as active!");
        return true;
      }
      
      // If still processing and attempts remain, retry
      if (attemptNum < maxRetries - 1) {
        return await attemptSubscriptionSync(sessionId, maxRetries, attemptNum + 1);
      }
      
      console.warn("Subscription not verified after max retries");
      toast({
        title: "Still Processing",
        description: "Your subscription is being processed. You'll be redirected to the success page.",
        duration: 5000,
      });
      return false;
    } catch (err) {
      console.error(`Subscription sync error (attempt ${attemptNum + 1}):`, err);
      
      // Still retry if attempts remain
      if (attemptNum < maxRetries - 1) {
        return await attemptSubscriptionSync(sessionId, maxRetries, attemptNum + 1);
      }
      
      console.warn("Failed to sync subscription after max retries");
      return false;
    }
  };
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setRedirecting(true);
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          // Stripe checkout was successful - show notification
          toast({
            title: "Payment Received",
            description: "Processing your subscription...",
            duration: 5000,
          });
          
          // Attempt to sync subscription status with retries
          await attemptSubscriptionSync(sessionId);
          
          // Even if sync fails, navigate to success page with the session_id and source parameters
          navigate(`/subscription-success?session_id=${sessionId}&source=checkout`, { replace: true });
        } else {
          // Direct access or after free plan selection - navigate to onboarding immediately
          navigate('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Redirect error:', error);
        toast({
          title: "Redirect Error",
          description: "There was a problem processing your subscription. Please try again or contact support.",
          variant: "destructive",
          duration: 5000,
        });
        // Even on error, redirect to subscription success to allow manual refresh
        const sessionId = new URLSearchParams(location.search).get('session_id');
        if (sessionId) {
          navigate(`/subscription-success?session_id=${sessionId}&source=checkout&error=true`, { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } finally {
        setRedirecting(false);
      }
    };
    
    handleRedirect();
  }, [location, navigate, toast, syncWithStripe]);

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <Card className="p-8 shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setting up your account</h2>
            <p className="text-muted-foreground">Just a moment while we prepare your dashboard...</p>
            {syncAttempt > 0 && (
              <p className="text-xs text-muted-foreground mt-2">Syncing subscription data (attempt {syncAttempt})...</p>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default OnboardingRedirect;
