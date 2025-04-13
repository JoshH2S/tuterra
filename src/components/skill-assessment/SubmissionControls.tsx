
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, WifiOff } from "lucide-react";

interface SubmissionControlsProps {
  isLastQuestion: boolean;
  currentQuestionIndex: number;
  isSubmitting: boolean;
  submissionProgress: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => Promise<void>;
  isOfflineMode?: boolean;
}

export const SubmissionControls = ({
  isLastQuestion,
  currentQuestionIndex,
  isSubmitting,
  submissionProgress,
  onPrevious,
  onNext,
  onSubmit,
  isOfflineMode
}: SubmissionControlsProps) => {
  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="flex items-center text-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
      </div>

      <div className="flex-1 flex justify-center max-w-[200px] mx-auto">
        {isSubmitting && (
          <div className="w-full px-2">
            <Progress value={submissionProgress} className="h-2" />
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Submitting...
            </p>
          </div>
        )}
      </div>

      <div className="flex">
        {!isLastQuestion ? (
          <Button
            variant="default"
            size="sm"
            onClick={onNext}
            disabled={isSubmitting}
            className="flex items-center text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center text-sm"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                Save Locally
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Submit
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
