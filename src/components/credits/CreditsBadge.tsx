
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditsDisplay } from "./CreditsDisplay";
import { useEffect } from "react";

export const CreditsBadge = ({ showFull = false }: { showFull?: boolean }) => {
  const { credits, loading, error, fetchUserCredits } = useUserCredits();

  useEffect(() => {
    if (error) {
      console.error("CreditsBadge error:", error);
    }
  }, [error]);

  if (loading) {
    return (
      <Badge variant="outline" className="ml-2 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading</span>
      </Badge>
    );
  }

  if (error || !credits) {
    return (
      <Badge variant="destructive" className="ml-2 gap-1 cursor-pointer touch-manipulation" onClick={() => fetchUserCredits()}>
        <AlertCircle className="h-3 w-3" />
        <span>Retry</span>
      </Badge>
    );
  }

  // Calculate total remaining credits from actual data
  const totalCredits = 
    (credits.quiz_credits || 0) + 
    (credits.interview_credits || 0) + 
    (credits.assessment_credits || 0) + 
    (credits.tutor_message_credits || 0);

  // Calculate maximum possible credits 
  const maxCredits = 12; // 5 + 1 + 1 + 5
  const percentage = Math.floor((totalCredits / maxCredits) * 100);

  // Determine color based on remaining credits
  let badgeVariant: "default" | "destructive" | "outline" = "outline";
  if (percentage <= 25) {
    badgeVariant = "destructive";
  } else if (percentage > 25 && percentage < 75) {
    badgeVariant = "default";
  }

  if (showFull) {
    return (
      <Badge variant={badgeVariant} className="gap-1">
        <Coins className="h-3 w-3" />
        <span>{totalCredits} credits left</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className="gap-1 cursor-help touch-manipulation">
            <Coins className="h-3 w-3" />
            <span>{totalCredits}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-0" side="bottom">
          <CreditsDisplay compact={true} showUpgradeButton={false} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
