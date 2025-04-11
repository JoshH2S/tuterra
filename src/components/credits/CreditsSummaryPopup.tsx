
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

  useEffect(() => {
    if (user && subscription.tier === 'free') {
      // Initial fetch when component mounts
      fetchUserCredits();
    }
  }, [user, subscription.tier, fetchUserCredits]);

  // Only show for free tier users
  if (subscription.tier !== 'free') {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Refresh credits data when opening the dialog
      fetchUserCredits();
    }
    setIsOpen(open);
  };

  const handleRetry = () => {
    fetchUserCredits();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-8 touch-manipulation"
          onClick={(e) => {
            e.preventDefault(); // Prevent double triggers
            console.log("Free Credits button clicked");
            // Don't set isOpen here - let DialogTrigger handle it
          }}
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
