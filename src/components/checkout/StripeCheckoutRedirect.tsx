
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StripeCheckoutRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createCheckoutSession } = useSubscriptionManagement();

  useEffect(() => {
    const initCheckout = async () => {
      try {
        await createCheckoutSession({
          planId: 'pro_plan',
          successUrl: `${window.location.origin}/onboarding`,
          cancelUrl: `${window.location.origin}/pricing`,
        });
      } catch (error) {
        console.error('Failed to create checkout session:', error);
        navigate('/pricing', { replace: true });
      }
    };

    initCheckout();
  }, [navigate, createCheckoutSession]);

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <Card className="p-8 shadow-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Redirecting to checkout</h2>
          <p className="text-muted-foreground">Please wait while we prepare your payment...</p>
        </Card>
      </motion.div>
    </div>
  );
};

export default StripeCheckoutRedirect;
