
import { useUserCredits } from "@/hooks/useUserCredits";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditsDisplay } from "./CreditsDisplay";
import { useEffect } from "react";

interface CreditsBadgeProps {
  showFull?: boolean;
  compact?: boolean;
}

export const CreditsBadge = ({ 
  showFull = false,
  compact = false
}: CreditsBadgeProps) => {
  const { credits, loading, error, fetchUserCredits, permissionError } = useUserCredits();

  useEffect(() => {
    if (error) {
      console.error("CreditsBadge error:", error);
    }
  }, [error]);

  const handleRetry = () => {
    fetchUserCredits();
  };

  if (loading) {
    return (
      <Badge variant="outline" className="ml-2 gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Credits</span>
      </Badge>
    );
  }

  if (error && !credits) {
    return (
      <Badge variant="destructive" className="ml-2 gap-1 cursor-pointer touch-manipulation" onClick={handleRetry}>
        <AlertCircle className="h-3 w-3" />
        <span className="text-xs">Retry</span>
      </Badge>
    );
  }

  // Ensure we have fallback values if credits is somehow null
  const safeCredits = credits || {
    id: 'fallback',
    user_id: 'unknown',
    quiz_credits: 5,
    interview_credits: 1,
    assessment_credits: 1,
    tutor_message_credits: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const creditsItems = [
    { label: "Quizzes", value: safeCredits.quiz_credits, total: 5 },
    { label: "Interview Simulations", value: safeCredits.interview_credits, total: 1 },
    { label: "Skill Assessments", value: safeCredits.assessment_credits, total: 1 },
    { label: "AI Tutor Messages", value: safeCredits.tutor_message_credits, total: 5 },
  ];

  // Calculate total remaining credits
  const totalCredits = 
    safeCredits.quiz_credits + 
    safeCredits.interview_credits + 
    safeCredits.assessment_credits + 
    safeCredits.tutor_message_credits;

  const maxCredits = 12; // 5 + 1 + 1 + 5
  const percentage = Math.floor((totalCredits / maxCredits) * 100);

  // Determine color based on remaining credits
  let badgeVariant: "default" | "destructive" | "outline" | "secondary" = "outline";
  if (percentage <= 25) {
    badgeVariant = "destructive";
  } else if (percentage > 25 && percentage < 75) {
    badgeVariant = "default";
  }

  // For offline mode, use a special indicator
  if (permissionError) {
    badgeVariant = "secondary";
  }

  if (compact) {
    return (
      <Badge variant={badgeVariant} className="gap-1">
        {permissionError ? <WifiOff className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
        <span>{totalCredits}</span>
      </Badge>
    );
  }

  if (showFull) {
    return (
      <Badge variant={badgeVariant} className="gap-1">
        {permissionError ? <WifiOff className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
        <span>{totalCredits} credits {permissionError ? "(offline)" : "left"}</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className="gap-1 cursor-help touch-manipulation">
            {permissionError ? <WifiOff className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
            <span>{totalCredits}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-0" side="bottom">
          <div className="p-2 space-y-1">
            {permissionError && (
              <div className="text-xs text-amber-500 flex items-center gap-1 mb-2 p-1 bg-amber-500/10 rounded">
                <WifiOff className="h-3 w-3" />
                <span>Offline mode - credits tracked locally</span>
              </div>
            )}
            <CreditsDisplay compact={true} showUpgradeButton={false} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
