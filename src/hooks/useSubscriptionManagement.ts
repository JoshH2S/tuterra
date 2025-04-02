
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export interface CheckoutOptions {
  planId: 'pro_plan' | 'premium_plan';
  successUrl: string;
  cancelUrl: string;
}

export const useSubscriptionManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const createCheckoutSession = async ({ planId, successUrl, cancelUrl }: CheckoutOptions) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          successUrl,
          cancelUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
        return true;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: `Failed to create checkout session: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'cancel'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Your subscription has been canceled. You'll still have access until the end of your billing period.",
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: `Failed to cancel subscription: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'reactivate'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Your subscription has been reactivated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error",
        description: `Failed to reactivate subscription: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createBillingPortalSession = async (returnUrl: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-billing-portal', {
        body: {
          returnUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.location.href = data.url;
        return true;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      toast({
        title: "Error",
        description: `Failed to access billing portal: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    createBillingPortalSession,
    loading,
    subscription,
    subscriptionLoading
  };
};
