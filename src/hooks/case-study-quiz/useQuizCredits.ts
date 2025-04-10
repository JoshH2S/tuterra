
import { useState } from "react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

export const useQuizCredits = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { checkCredits, decrementCredits } = useUserCredits();
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
    }
    return true;
  };

  const useCredit = async () => {
    if (subscription.tier === 'free') {
      await decrementCredits('quiz_credits');
    }
  };

  return {
    showUpgradePrompt,
    setShowUpgradePrompt,
    validateCredits,
    useCredit,
    subscription
  };
};
