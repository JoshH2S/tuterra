
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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
    <div className="mt-10 flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={handlePreviousStep}
        disabled={currentStep === 1}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-600 hover:bg-transparent px-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {currentStep < totalSteps ? (
        <button
          onClick={handleNextStep}
          disabled={!canProceedToNextStep}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !canProceedToNextStep}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? "Generating..." : "Generate Quiz"}
        </button>
      )}
    </div>
  );
};
