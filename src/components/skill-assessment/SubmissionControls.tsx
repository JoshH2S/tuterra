import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, WifiOff, Loader2 } from "lucide-react";

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
  isOfflineMode,
}: SubmissionControlsProps) => {
  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0 || isSubmitting}
        className="rounded-full px-5 h-9 text-sm font-medium border-gray-200 text-gray-600 hover:border-gray-300"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      {/* Submission progress */}
      {isSubmitting && (
        <div className="flex-1 max-w-[180px] mx-4 space-y-1">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C8A84B] rounded-full"
              animate={{ width: `${submissionProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center text-gray-400">Submitting…</p>
        </div>
      )}

      {!isLastQuestion ? (
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className="rounded-full px-6 h-9 bg-[#091747] hover:bg-[#0d2060] text-white text-sm font-medium"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-full px-6 h-9 bg-[#091747] hover:bg-[#0d2060] text-white text-sm font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Submitting…
            </>
          ) : isOfflineMode ? (
            <>
              <WifiOff className="h-3.5 w-3.5 mr-2" />
              Save Locally
            </>
          ) : (
            <>
              <CheckCircle className="h-3.5 w-3.5 mr-2" />
              Submit Assessment
            </>
          )}
        </Button>
      )}
    </div>
  );
};
