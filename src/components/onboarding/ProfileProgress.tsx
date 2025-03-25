
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface ProfileProgressProps {
  progressPercentage: number;
  progressMessage: string;
  step: number;
  totalSteps: number;
  isCurrentStepValid: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export const ProfileProgress = ({
  progressPercentage,
  progressMessage,
  step,
  totalSteps,
  isCurrentStepValid,
  isSubmitting,
  onBack,
  onNext,
  onComplete
}: ProfileProgressProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CircularProgress 
          percentage={progressPercentage} 
          size={44} 
          strokeWidth={5}
        />
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{progressMessage}</p>
          <p className="text-xs text-gray-500">{Math.round(progressPercentage)}% complete</p>
        </div>
      </div>
      
      <div className="flex gap-3">
        {step > 1 ? (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-1 min-w-[90px]"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <div></div> // Empty div to maintain layout
        )}
        
        {step < totalSteps ? (
          <Button 
            onClick={onNext}
            className="gap-1 min-w-[90px]"
            disabled={!isCurrentStepValid}
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onComplete}
            className="gap-1 min-w-[120px]"
            disabled={isSubmitting || !isCurrentStepValid}
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>Complete <Check className="h-4 w-4" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
