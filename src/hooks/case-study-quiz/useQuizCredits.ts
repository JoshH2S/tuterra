
import { useState, useEffect } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

export const useQuizCredits = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { checkCredits, decrementCredits, credits, fetchUserCredits, permissionError } = useUserCredits();
  const { subscription } = useSubscription();

  // Track if we've already shown the credit validation toast to avoid duplicates
  const [hasShownCreditToast, setHasShownCreditToast] = useState(false);
  
  // Always get fresh credits data before validating
  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

  const validateCredits = async (): Promise<boolean> => {
    try {
      if (subscription.tier === 'free') {
        // Always fetch the latest credits before checking
        await fetchUserCredits();
        const hasCredits = await checkCredits('quiz_credits');
        
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
        if (credits?.quiz_credits && !hasShownCreditToast && !permissionError) {
          const remainingAfterUse = credits.quiz_credits - 1;
          toast({
            title: "Credit Usage",
            description: `You have ${remainingAfterUse} quiz ${remainingAfterUse === 1 ? 'credit' : 'credits'} remaining after this use.`,
            variant: "default",
          });
          setHasShownCreditToast(true);
        }
      }
      return true;
    } catch (error) {
      console.error("Error validating credits:", error);
      
      // Even if there's an error checking credits, we'll allow the user to proceed
      // but show a toast about operating in offline mode
      if (!hasShownCreditToast) {
        toast({
          title: "Offline Mode",
          description: "Operating in offline mode. Your credits will be tracked locally.",
          variant: "default",
        });
        setHasShownCreditToast(true);
      }
      
      // Always return true to let the user proceed, even if there are backend issues
      return true;
    }
  };

  const useCredit = async () => {
    try {
      // Reset the toast flag when actually using a credit
      setHasShownCreditToast(false);
      
      // Always fetch the latest credits before decrementing
      await fetchUserCredits();
      
      if (subscription.tier === 'free') {
        const success = await decrementCredits('quiz_credits');
        
        // Show an accurate toast with remaining credits after successful decrement
        if (success && credits && !permissionError) {
          // Refresh credits to get the updated count
          await fetchUserCredits();
          
          const remainingCredits = credits.quiz_credits;
          toast({
            title: "Credit Usage",
            description: `You have ${remainingCredits} quiz ${remainingCredits === 1 ? 'credit' : 'credits'} remaining.`,
            variant: "default",
          });
        }
        
        return success;
      }
      return true;
    } catch (error) {
      console.error("Error using credit:", error);
      
      // Notify the user about offline mode
      toast({
        title: "Offline Mode Active",
        description: "Your credits are being managed locally until connection is restored.",
        variant: "default",
      });
      
      // Let the user proceed despite the error
      return true;
    }
  };

  const getRemainingCredits = () => {
    return credits?.quiz_credits || 0;
  };

  return {
    showUpgradePrompt,
    setShowUpgradePrompt,
    validateCredits,
    useCredit,
    getRemainingCredits,
    subscription,
    offlineMode: permissionError
  };
};
