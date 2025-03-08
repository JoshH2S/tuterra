
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuizNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  canProceedToNextStep: boolean;
  isProcessing: boolean;
  handleSubmit: () => void;
}

export const QuizNavigationButtons = ({
  currentStep,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
  canProceedToNextStep,
  isProcessing,
  handleSubmit,
}: QuizNavigationButtonsProps) => {
  return (
    <div className="mt-8 flex items-center justify-between">
      <Button
        variant="outline"
        onClick={handlePreviousStep}
        disabled={currentStep === 1}
        className="px-4 py-2 h-12"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>
      
      {currentStep < 4 ? (
        <Button
          onClick={handleNextStep}
          disabled={!canProceedToNextStep}
          className="px-6 py-2 h-12"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !canProceedToNextStep}
          className="px-6 py-2 h-12"
        >
          {isProcessing ? 'Generating...' : 'Generate Quiz'}
        </Button>
      )}
    </div>
  );
};
