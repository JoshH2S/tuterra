
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
      await syncWithStripe(sessionId);
      
      // If we reached here without errors, consider it a success
      return true;
    } catch (err) {
      console.error(`Subscription sync error (attempt ${attemptNum + 1}):`, err);
      
      // Still retry on error if attempts remain
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
          // Stripe checkout was successful - wait briefly to let webhook process if needed
          toast({
            title: "Success!",
            description: "Your pro subscription is now active.",
          });
          
          // Attempt to sync subscription status with retries
          await attemptSubscriptionSync(sessionId);
          
          // Even if sync fails, we still navigate to success page
          // Important: Use the right route path that matches our route configuration
          navigate(`/subscription-success?session_id=${sessionId}`, { replace: true });
        } else {
          // Direct access or after free plan selection - navigate to onboarding immediately
          navigate('/onboarding', { replace: true });
        }
      } catch (error) {
        console.error('Redirect error:', error);
        // Even on error, we redirect to onboarding to prevent users getting stuck
        navigate('/onboarding', { replace: true });
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
