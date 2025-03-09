
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
    <div className="flex justify-between items-center mt-4 touch-manipulation">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0 || isSubmitting}
        className="h-12 px-3 md:px-4 touch-manipulation"
        size="lg"
      >
        <ChevronLeft className="h-5 w-5 md:mr-2" />
        <span className="hidden md:inline">Previous</span>
      </Button>

      {isLastQuestion ? (
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-12 touch-manipulation"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {submissionProgress > 0 ? `${submissionProgress}%` : 'Submitting...'}
            </>
          ) : (
            <>
              <Flag className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Finish Assessment</span>
              <span className="inline md:hidden">Finish</span>
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={onNext}
          className="h-12 px-3 md:px-4 touch-manipulation"
          size="lg"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-5 w-5 md:ml-2" />
        </Button>
      )}
    </div>
  );
};
