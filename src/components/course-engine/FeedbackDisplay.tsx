import { CheckCircle, AlertCircle, ArrowRight, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";
import { AIFeedback } from "@/types/course-engine";
import { cn } from "@/lib/utils";

interface FeedbackDisplayProps {
  feedback: AIFeedback;
  onContinue: () => void;
}

export function FeedbackDisplay({ feedback, onContinue }: FeedbackDisplayProps) {
  const score = feedback.overallScore || 0;
  const isPassing = score >= 70;

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Good Job!';
    if (score >= 50) return 'Keep Going';
    return 'Try Again';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Score Header */}
      <div className="text-center py-6">
        <div className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
          isPassing ? "bg-green-500/10" : "bg-amber-500/10"
        )}>
          {isPassing ? (
            <CheckCircle className="h-10 w-10 text-green-500" />
          ) : (
            <AlertCircle className="h-10 w-10 text-amber-500" />
          )}
        </div>
        
        {score > 0 && (
          <>
            <p className={cn("text-4xl font-bold mb-1", getScoreColor())}>
              {score}%
            </p>
            <p className="text-lg font-medium text-muted-foreground">
              {getScoreLabel()}
            </p>
          </>
        )}
      </div>

      {/* Main Feedback */}
      <PremiumCard className="p-5">
        <p className="text-base leading-relaxed">{feedback.feedback}</p>
      </PremiumCard>

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <PremiumCard className="p-5 bg-green-500/5 border-green-500/20">
          <h3 className="font-semibold flex items-center gap-2 mb-3 text-green-600">
            <CheckCircle className="h-4 w-4" />
            What You Did Well
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}

      {/* Areas for Improvement */}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <PremiumCard className="p-5 bg-amber-500/5 border-amber-500/20">
          <h3 className="font-semibold flex items-center gap-2 mb-3 text-amber-600">
            <Target className="h-4 w-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}

      {/* Concepts to Review */}
      {feedback.conceptsToReview && feedback.conceptsToReview.length > 0 && (
        <PremiumCard className="p-5 bg-primary/5 border-primary/20">
          <h3 className="font-semibold flex items-center gap-2 mb-3 text-primary">
            <Lightbulb className="h-4 w-4" />
            Concepts to Review
          </h3>
          <div className="flex flex-wrap gap-2">
            {feedback.conceptsToReview.map((concept, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-primary/10 rounded-full text-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Next Step Guidance */}
      {feedback.nextStepGuidance && (
        <div className="text-center text-muted-foreground text-sm">
          <p>{feedback.nextStepGuidance}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onContinue} size="lg">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
