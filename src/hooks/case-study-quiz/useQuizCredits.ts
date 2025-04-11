
import { useState } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

export const useQuizCredits = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { checkCredits, decrementCredits, credits } = useUserCredits();
  const { subscription } = useSubscription();

  const validateCredits = async (): Promise<boolean> => {
    if (subscription.tier === 'free') {
      const hasCredits = await checkCredits('quiz_credits');
      
      if (!hasCredits) {
        setShowUpgradePrompt(true);
        toast({
          title: "No credits remaining",
          description: "You have used all your free quiz credits. Please upgrade to continue.",
          variant: "destructive",
        });
        return false;
      }
      
      // Add info toast about remaining credits
      if (credits?.quiz_credits) {
        const remainingAfterUse = credits.quiz_credits - 1;
        toast({
          title: "Credit Usage",
          description: `You have ${remainingAfterUse} quiz ${remainingAfterUse === 1 ? 'credit' : 'credits'} remaining after this use.`,
          variant: "default",
        });
      }
    }
    return true;
  };

  const useCredit = async () => {
    if (subscription.tier === 'free') {
      return await decrementCredits('quiz_credits');
    }
    return true;
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
    subscription
  };
};
