
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

interface NavigationFooterProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  isGenerating?: boolean;
  onGenerate?: () => void;
}

export const NavigationFooter = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled,
  isGenerating = false,
  onGenerate,
}: NavigationFooterProps) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFinalStep = currentStep === totalSteps;

  return (
    <motion.div 
      className="flex items-center justify-between mt-8 pt-4 border-t"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1 || isGenerating}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex items-center gap-4">
        {isFinalStep && onGenerate ? (
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isGenerating}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
