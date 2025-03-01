
import { Button } from "@/components/ui/button";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuizNavigation = ({
  currentQuestion,
  totalQuestions,
  onNext,
  onPrevious,
}: QuizNavigationProps) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        disabled={currentQuestion === 0}
        onClick={onPrevious}
        className="min-w-[100px]"
      >
        Previous
      </Button>
      {currentQuestion < totalQuestions - 1 ? (
        <Button
          onClick={onNext}
          className="min-w-[100px]"
        >
          Next
        </Button>
      ) : null}
    </div>
  );
};
