
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { CreditsSummaryPopup } from "@/components/credits/CreditsSummaryPopup";

export function DesktopHeader() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <header className="sticky top-0 z-40 hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Removing EduPortal text from here since it's already in the sidebar */}
        </div>
        <div className="flex items-center gap-4">
          <div className={subscription?.tier === 'free' ? "" : "hidden"}>
            <CreditsSummaryPopup />
          </div>
          {/* Upgrade button only appears for free users */}
          {subscription?.tier === 'free' && (
            <Button
              variant="default"
              onClick={handleUpgradeClick}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
