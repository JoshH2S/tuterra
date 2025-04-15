
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
  isOfflineMode?: boolean;
}

export const CreditsDisplay = ({ 
  showUpgradeButton = true, 
  compact = false,
  onRetry,
  isOfflineMode: propIsOfflineMode
}: CreditsDisplayProps) => {
  const { credits, loading, error, fetchUserCredits, isOfflineMode: hookIsOfflineMode } = useUserCredits();
  const navigate = useNavigate();
  
  const isOfflineMode = propIsOfflineMode !== undefined ? propIsOfflineMode : hookIsOfflineMode;

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

  if (error && !credits) {
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

  const safeCredits = credits || {
    id: 'fallback',
    user_id: 'unknown',
    quiz_credits: 5,
    interview_credits: 2,  // Set to 2 for free tier
    assessment_credits: 2,
    tutor_message_credits: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const creditsItems = [
    { label: "Quizzes", value: safeCredits.quiz_credits, total: 5 },
    { label: "Interview Simulations", value: safeCredits.interview_credits, total: 2 }, // Updated total to 2
    { label: "Skill Assessments", value: safeCredits.assessment_credits, total: 2 },
    { label: "AI Tutor Messages", value: safeCredits.tutor_message_credits, total: 5 },
  ];

  const allCreditsUsed = creditsItems.every(item => item.value === 0);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Mobile-optimized compact view
  if (compact) {
    return (
      <div className="space-y-2 p-2">
        {isOfflineMode && (
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-2 p-1 bg-amber-500/10 rounded touch-manipulation">
            <WifiOff className="h-3 w-3" />
            <span>Offline mode - Using local credits</span>
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

  // Full view with responsive design
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          {isOfflineMode ? "Offline Credits" : "Free Credits Remaining"}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full touch-manipulation">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Credit information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] sm:max-w-none text-xs sm:text-sm">
                <p>
                  {isOfflineMode 
                    ? "Using local credits while offline. Changes won't sync to the server until you're back online."
                    : "Free users receive a limited number of credits to explore our platform features. Upgrade to Premium for unlimited access."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          {isOfflineMode 
            ? "Local credits for offline usage"
            : "Your free credits to explore our platform"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOfflineMode && (
          <Alert variant="default" className="mb-4 bg-amber-500/10 text-amber-700 border-amber-200">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Offline Mode Active</AlertTitle>
            <AlertDescription>
              Using local credits while offline. Your usage won't be synchronized with the server.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {creditsItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className={`font-medium ${item.value === 0 ? 'text-destructive' : ''}`}>
                  {item.value}/{item.total}
                </span>
              </div>
              <Progress 
                value={(item.value / item.total) * 100} 
                className="h-2 touch-manipulation"
                aria-label={`${item.label} credits: ${item.value} out of ${item.total}`}
              />
            </div>
          ))}

          {allCreditsUsed && showUpgradeButton && (
            <Button 
              className="w-full mt-4 touch-manipulation active:scale-95 transition-transform"
              size="lg" 
              onClick={handleUpgrade}
            >
              Upgrade to Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
