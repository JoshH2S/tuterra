
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditsDisplay } from "./CreditsDisplay";

export const CreditsBadge = () => {
  const { credits, loading } = useUserCredits();

  if (loading) {
    return (
      <Badge variant="outline" className="ml-2 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Credits</span>
      </Badge>
    );
  }

  if (!credits) return null;

  // Calculate total remaining credits
  const totalCredits = 
    credits.quiz_credits + 
    credits.interview_credits + 
    credits.assessment_credits + 
    credits.tutor_message_credits;

  const maxCredits = 9; // 2 + 1 + 1 + 5
  const percentage = Math.floor((totalCredits / maxCredits) * 100);

  // Determine color based on remaining credits
  let badgeVariant: "default" | "destructive" | "outline" = "outline";
  if (percentage <= 25) {
    badgeVariant = "destructive";
  } else if (percentage > 25 && percentage < 75) {
    badgeVariant = "default";
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className="gap-1 cursor-help">
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
};
