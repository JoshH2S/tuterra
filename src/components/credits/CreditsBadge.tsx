
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, AlertCircle, WifiOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditsDisplay } from "./CreditsDisplay";
import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";

export const CreditsBadge = ({ showFull = false }: { showFull?: boolean }) => {
  const { credits, loading, error, isOfflineMode, fetchUserCredits } = useUserCredits();
  const { subscription } = useSubscription();

  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

  useEffect(() => {
    if (error) {
      console.error("CreditsBadge error:", error);
    }
  }, [error]);

  const shouldRender = subscription.tier === "free";
  if (!shouldRender) return null;

  if (loading) {
    return (
      <Badge variant="outline" className="ml-2 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Credits</span>
      </Badge>
    );
  }

  if (error && !credits && !isOfflineMode) {
    return (
      <Badge
        variant="destructive"
        className="ml-2 gap-1 cursor-pointer touch-manipulation active:scale-95 transition-transform"
        onClick={() => fetchUserCredits()}
      >
        <AlertCircle className="h-3 w-3" />
        <span>Retry</span>
      </Badge>
    );
  }

  const safeCredits = credits || {
    quiz_credits: 5,
    interview_credits: 2,
    assessment_credits: 2,
  };

  const totalCredits =
    safeCredits.quiz_credits +
    safeCredits.interview_credits +
    safeCredits.assessment_credits;

  const maxCredits = 9;

  const percentage = Math.floor((totalCredits / maxCredits) * 100);

  let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "outline";
  if (percentage <= 25) {
    badgeVariant = "destructive";
  } else if (percentage > 25 && percentage < 75) {
    badgeVariant = "default";
  }

  if (isOfflineMode) {
    badgeVariant = "secondary";
  }

  if (showFull) {
    return (
      <Badge
        variant={badgeVariant}
        className="gap-1 touch-manipulation active:scale-95 transition-transform"
      >
        {isOfflineMode ? (
          <WifiOff className="h-3 w-3" />
        ) : (
          <Coins className="h-3 w-3" />
        )}
        <span>{isOfflineMode ? "Offline Mode" : `${totalCredits} credits left`}</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge
            variant={badgeVariant}
            className="gap-1 cursor-help touch-manipulation active:scale-95 transition-transform"
          >
            {isOfflineMode ? (
              <WifiOff className="h-3 w-3" />
            ) : (
              <Coins className="h-3 w-3" />
            )}
            <span>{isOfflineMode ? "Offline" : totalCredits}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-0" side="bottom">
          <CreditsDisplay
            compact={true}
            showUpgradeButton={false}
            isOfflineMode={isOfflineMode}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
