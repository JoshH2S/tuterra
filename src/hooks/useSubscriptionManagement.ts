import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export interface CheckoutOptions {
  planId: "pro_plan" | string;
  successUrl: string;
  cancelUrl: string;
}

export const useSubscriptionManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading, refetch, syncWithStripe } = useSubscription();

  const createCheckoutSession = async ({ planId, successUrl, cancelUrl }: CheckoutOptions) => {
    setLoading(true);
    
    try {
      // Log request details for debugging
      console.log('Creating checkout session for:', { planId, successUrl, cancelUrl });
      
      // Ensure the user's session is active and we have an access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        throw new Error('You need to be logged in to access this feature');
      }
      
      console.log('Session verified, invoking checkout function');
      
      // Modify the success URL to include source parameter for better tracking
      const enhancedSuccessUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}source=checkout`;
      
      // Modify the cancel URL to include a canceled flag
      const enhancedCancelUrl = `${cancelUrl}${cancelUrl.includes('?') ? '&' : '?'}canceled=true`;
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          successUrl: enhancedSuccessUrl,
          cancelUrl: enhancedCancelUrl
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error invoking checkout service');
      }

      if (!data) {
        console.error('No data returned from checkout function');
        throw new Error('No response from checkout service');
      }

      if (data?.url) {
        console.log('Redirecting to checkout URL:', data.url);
        window.location.href = data.url;
        return true;
      } else {
        console.error('No URL in checkout response:', data);
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session. Please try again or contact support.",
        variant: "destructive",
        duration: 5000,
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
      
      // Refresh subscription data
      await refetch(true);
      
      return true;
    } catch (error: any) {
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
      
      // Refresh subscription data
      await refetch(true);
      
      return true;
    } catch (error: any) {
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
    } catch (error: any) {
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
    subscriptionLoading,
    syncWithStripe
  };
};
