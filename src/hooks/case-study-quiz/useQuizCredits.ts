
import { useState, useEffect } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

export const useQuizCredits = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { checkCredits, decrementCredits, credits, fetchUserCredits, loading } = useUserCredits();
  const { subscription } = useSubscription();

  // Track if we've already shown the credit validation toast to avoid duplicates
  const [hasShownCreditToast, setHasShownCreditToast] = useState(false);
  
  // Always get fresh credits data before validating
  useEffect(() => {
    if (subscription.tier === 'free') {
      fetchUserCredits();
    }
  }, [fetchUserCredits, subscription.tier]);

  const validateCredits = async (): Promise<boolean> => {
    if (subscription.tier === 'free') {
      // Always fetch the latest credits before checking
      const freshCredits = await fetchUserCredits();
      
      // If credits are still loading or null, we can't validate
      if (loading || !freshCredits) {
        console.log("Credits still loading or unavailable, deferring validation");
        return false;
      }
      
      const hasCredits = checkCredits('quiz_credits');
      
      if (!hasCredits) {
        setShowUpgradePrompt(true);
        if (!hasShownCreditToast) {
          toast({
            title: "No credits remaining",
            description: "You have used all your free quiz credits. Please upgrade to continue.",
            variant: "destructive",
          });
          setHasShownCreditToast(true);
        }
        return false;
      }
      
      // Add info toast about remaining credits
      if (freshCredits?.quiz_credits && !hasShownCreditToast) {
        const remainingAfterUse = freshCredits.quiz_credits - 1;
        toast({
          title: "Credit Usage",
          description: `You have ${remainingAfterUse} quiz ${remainingAfterUse === 1 ? 'credit' : 'credits'} remaining after this use.`,
          variant: "default",
        });
        setHasShownCreditToast(true);
      }
    }
    return true;
  };

  const useCredit = async () => {
    // Reset the toast flag when actually using a credit
    setHasShownCreditToast(false);
    
    // Skip credit deduction for premium users
    if (subscription.tier !== 'free') {
      return true;
    }
    
    // Check if credits data is available before proceeding
    if (!credits) {
      // Fetch credits first if not available
      await fetchUserCredits();
      // If still no credits after fetching, we can't proceed
      if (!credits) {
        toast({
          title: "Error",
          description: "Unable to verify available credits. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    // Decrement the quiz credit
    const success = await decrementCredits('quiz_credits');
    
    // Refresh credits immediately to get the updated count
    if (success) {
      await fetchUserCredits();
    }
    
    return success;
  };

  const getRemainingCredits = (): number => {
    if (loading || !credits) {
      return 0; // Explicitly return 0 when loading or no data yet
    }
    return credits.quiz_credits;
  };

  return {
    showUpgradePrompt,
    setShowUpgradePrompt,
    validateCredits,
    useCredit,
    getRemainingCredits,
    subscription,
    loading
  };
};
