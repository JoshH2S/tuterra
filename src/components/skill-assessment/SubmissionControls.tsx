
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      className={`flex justify-between items-center mt-4 touch-manipulation ${isMobile ? 'fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-20' : ''}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className="h-12 px-3 md:px-4 touch-manipulation"
          size="lg"
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Previous</span>
        </Button>
      </motion.div>

      {isLastQuestion ? (
        <motion.div 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="flex-1 mx-2 md:flex-none"
        >
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-12 w-full md:w-auto touch-manipulation"
            size="lg"
            aria-label="Finish assessment"
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
        </motion.div>
      ) : (
        <motion.div 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="flex-1 mx-2 md:flex-none"
        >
          <Button 
            onClick={onNext}
            className="h-12 px-3 md:px-4 w-full md:w-auto touch-manipulation"
            size="lg"
            aria-label="Next question"
          >
            <span className="hidden md:inline">Next</span>
            <span className="inline md:hidden">Next Question</span>
            <ChevronRight className="h-5 w-5 md:ml-2" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
