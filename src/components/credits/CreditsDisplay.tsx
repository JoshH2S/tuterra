
import { useUserCredits } from "@/hooks/useUserCredits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreditsDisplayProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export const CreditsDisplay = ({ showUpgradeButton = true, compact = false }: CreditsDisplayProps) => {
  const { credits, loading, error } = useUserCredits();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !credits) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Unable to load your credits information"}
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
        <CardTitle>Free Credits Remaining</CardTitle>
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
            <Button className="w-full mt-4" size="lg">
              Upgrade to Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
