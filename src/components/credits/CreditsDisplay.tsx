
import { useUserCredits } from "@/hooks/useUserCredits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, Info } from "lucide-react";
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
  const { credits, loading, error, fetchUserCredits } = useUserCredits();
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
      <div className="flex flex-col items-center justify-center p-4 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your credits...</p>
      </div>
    );
  }

  if (error || !credits) {
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

  const creditsItems = [
    { label: "Quizzes", value: credits.quiz_credits, total: 5 },
    { label: "Interview Simulations", value: credits.interview_credits, total: 1 },
    { label: "Skill Assessments", value: credits.assessment_credits, total: 1 },
    { label: "AI Tutor Messages", value: credits.tutor_message_credits, total: 5 },
  ];

  const allCreditsUsed = creditsItems.every(item => item.value === 0);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (compact) {
    return (
      <div className="space-y-2 p-2">
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
        </div>
      </CardContent>
    </Card>
  );
};
