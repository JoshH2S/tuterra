
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
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
  const isFinalStep = currentStep === totalSteps;

  return (
    <motion.div
      className="flex items-center justify-between mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={currentStep === 1 || isGenerating}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-600 hover:bg-transparent px-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        {isFinalStep && onGenerate ? (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isNextDisabled || isGenerating}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
