
import { useState, useEffect } from "react";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { CreditsDisplay } from "@/components/credits/CreditsDisplay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useAuth } from "@/hooks/useAuth";

export function CreditsSummaryPopup() {
  const { subscription } = useSubscription();
  const { fetchUserCredits, loading, error, credits } = useUserCredits();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showForUser, setShowForUser] = useState(true);

  useEffect(() => {
    // Determine if we should show for this user based on tier
    setShowForUser(subscription.tier === 'free');
  }, [subscription.tier]);

  useEffect(() => {
    if (user && subscription.tier === 'free') {
      fetchUserCredits();
    }
  }, [user, subscription.tier, fetchUserCredits]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchUserCredits();
    }
    setIsOpen(open);
  };

  const handleRetry = () => {
    fetchUserCredits();
  };

  if (credits) {
    console.log("Current credits state:", {
      quiz_credits: credits.quiz_credits,
      interview_credits: credits.interview_credits,
      assessment_credits: credits.assessment_credits,
      tutor_message_credits: credits.tutor_message_credits
    });
  }

  // If we're not showing for this user, return null
  if (!showForUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-8 touch-manipulation"
          onClick={() => console.log("Free Credits button clicked")}
        >
          <Coins className="h-3.5 w-3.5" />
          <span>Free Credits</span>
          <CreditsBadge />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Free Credits</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CreditsDisplay 
            compact={false} 
            showUpgradeButton={true} 
            onRetry={handleRetry}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
