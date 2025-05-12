
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useToast } from "@/hooks/use-toast";

export function usePricingPage() {
  const { isLoggedIn } = useAuthStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const { createCheckoutSession, subscription, subscriptionLoading, cancelSubscription } = useSubscriptionManagement();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('canceled') === 'true') {
      toast({
        title: "Checkout Canceled",
        description: "Your checkout process was canceled. You can try again when you're ready.",
      });
      
      navigate('/pricing', { replace: true });
    }
  }, [location.search, toast, navigate]);
  
  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free_plan') {
      navigate('/auth?tab=signup&plan=free');
      return;
    }
    
    if (planId === 'enterprise_plan') {
      navigate('/contact');
      return;
    }
    
    if (isLoggedIn) {
      navigate('/profile-settings');
      return;
    }
    
    navigate(`/auth?tab=signup&plan=${planId}`);
  };

  const handlePlanDowngrade = async () => {
    if (!confirm("Are you sure you want to downgrade to the free plan? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }
    
    setIsRedirecting(true);
    const success = await cancelSubscription();
    setIsRedirecting(false);
    
    if (success) {
      toast({
        title: "Plan Downgraded",
        description: "Your subscription will be downgraded to the free plan at the end of your billing period.",
      });
      navigate('/profile-settings');
    }
  };

  const isCurrentPlanPro = subscription?.planId === 'pro_plan' && subscription.status === 'active';

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRedirecting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRedirecting]);

  const calculateAnnualSavings = useCallback((monthlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const yearlyPrice = monthlyTotal * 0.8; // 20% discount
    const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(savings);
  }, []);

  return {
    billingInterval,
    setBillingInterval,
    isRedirecting,
    subscription,
    subscriptionLoading,
    isCurrentPlanPro,
    handleSelectPlan,
    handlePlanDowngrade,
    calculateAnnualSavings,
    showCanceledAlert: location.search.includes('canceled=true')
  };
}
