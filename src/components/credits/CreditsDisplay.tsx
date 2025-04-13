
import { useUserCredits } from "@/hooks/useUserCredits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, Info, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreditsDisplayProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
  onRetry?: () => void;
}

export const CreditsDisplay = ({ 
  showUpgradeButton = true, 
  compact = false,
  onRetry 
}: CreditsDisplayProps) => {
  const { credits, loading, error, fetchUserCredits, permissionError } = useUserCredits();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error("CreditsDisplay error:", error);
    }
  }, [error]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      fetchUserCredits();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !credits && !permissionError) {
    return (
      <Alert variant="destructive" className={compact ? "m-2" : "mb-4"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error || "Unable to load your credits information"}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-2 flex items-center gap-1.5 touch-manipulation"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Fallback credits if somehow credits is null
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

  const allCreditsUsed = creditsItems.every(item => item.value === 0);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (compact) {
    return (
      <div className="space-y-2 p-2">
        {permissionError && (
          <div className="text-xs text-amber-500 flex items-center gap-1 mb-2 p-1 bg-amber-500/10 rounded">
            <WifiOff className="h-3 w-3" />
            <span>Offline mode - using local credits</span>
          </div>
        )}
        {creditsItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span>{item.label}:</span>
            <span className={`font-medium ${item.value === 0 ? 'text-destructive' : 'text-primary'}`}>
              {item.value} left
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          Free Credits Remaining
          {permissionError && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline Mode</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Using local credits tracking. Will sync when connection is restored.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Credit information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Free users receive a limited number of credits to explore our platform features. Upgrade to Premium for unlimited access.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Your free credits to explore our platform
          {permissionError && (
            <span className="text-xs block mt-1 text-amber-500">
              (Credits are being tracked locally due to connection issues)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creditsItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className={`font-medium ${item.value === 0 ? 'text-destructive' : ''}`}>
                  {item.value}/{item.total}
                </span>
              </div>
              <Progress value={(item.value / item.total) * 100} className="h-2" />
            </div>
          ))}

          {allCreditsUsed && showUpgradeButton && (
            <Button className="w-full mt-4 touch-manipulation" size="lg" onClick={handleUpgrade}>
              Upgrade to Continue
            </Button>
          )}
          
          {permissionError && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="mt-4 w-full flex items-center justify-center gap-1.5 touch-manipulation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Connection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
