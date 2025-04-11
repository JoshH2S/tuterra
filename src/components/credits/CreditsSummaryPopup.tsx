
import { useState } from "react";
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

export function CreditsSummaryPopup() {
  const { subscription } = useSubscription();
  const { fetchUserCredits } = useUserCredits();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
