
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const StripeCheckoutRedirect = () => {
  const navigate = useNavigate();
  const { createCheckoutSession } = useSubscriptionManagement();
  const { toast } = useToast();

  useEffect(() => {
    const initCheckout = async () => {
      try {
        console.log('Initializing checkout from redirect component');
        
        const success = await createCheckoutSession({
          planId: 'pro_plan',
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/pricing`,
        });

        if (!success) {
          console.error('Checkout initialization failed');
          throw new Error('Failed to initialize checkout session');
        }
        
        // Note: The actual redirect happens in createCheckoutSession
      } catch (error: any) {
        console.error('Checkout redirect error:', error);
        
        toast({
          title: "Checkout Error",
          description: "Unable to start checkout process. Returning to pricing page.",
          variant: "destructive",
          duration: 5000,
        });
        
        // Redirect back to pricing page on error
        navigate('/pricing', { replace: true });
      }
    };

    initCheckout();
  }, [navigate, createCheckoutSession, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full max-w-sm"
      >
        <Card className="p-8 shadow-lg border-0">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Redirecting to checkout</h2>
          <p className="text-muted-foreground text-sm">Please wait while we prepare your payment...</p>
          <p className="text-xs text-muted-foreground mt-4">You'll be redirected to Stripe secure checkout in a moment</p>
        </Card>
      </motion.div>
    </div>
  );
};

export default StripeCheckoutRedirect;
