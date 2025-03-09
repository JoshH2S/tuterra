
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";

interface SubmissionControlsProps {
  isLastQuestion: boolean;
  currentQuestionIndex: number;
  isSubmitting: boolean;
  submissionProgress: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const SubmissionControls = ({
  isLastQuestion,
  currentQuestionIndex,
  isSubmitting,
  submissionProgress,
  onPrevious,
  onNext,
  onSubmit
}: SubmissionControlsProps) => {
  return (
    <div className="flex justify-between mt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0 || isSubmitting}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {isLastQuestion ? (
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submissionProgress > 0 ? `Submitting (${submissionProgress}%)` : 'Submitting...'}
            </>
          ) : (
            <>
              <Flag className="mr-2 h-4 w-4" />
              Finish Assessment
            </>
          )}
        </Button>
      ) : (
        <Button onClick={onNext}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
