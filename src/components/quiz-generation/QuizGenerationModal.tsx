
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface QuizGenerationProgressProps {
  stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
  percent: number;
  message: string;
  error?: string;
  details?: string;
}

interface QuizGenerationModalProps {
  isOpen: boolean;
  progress: QuizGenerationProgressProps;
  onRetry?: () => void;
}

export function QuizGenerationModal({ 
  isOpen, 
  progress,
  onRetry
}: QuizGenerationModalProps) {
  const getProgressColor = () => {
    if (progress.stage === 'error') return "bg-destructive";
    if (progress.percent < 50) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-[#F9F8F6] border-black/[0.06] overflow-hidden">
        {/* Visual anchor */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C8A84B]/70 via-amber-200/80 to-transparent" />

        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-[#091747]">
            {progress.stage === 'error' ? 'Error Generating Quiz' : 'Generating Quiz'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 leading-relaxed">
            {progress.stage === 'error'
              ? 'There was a problem generating your quiz. You can try again or adjust your input.'
              : 'Please wait while we process your content and generate questions.'}
          </DialogDescription>
        </DialogHeader>

        {progress.stage !== 'error' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#C8A84B]" />
            </div>

            <p className="text-sm text-gray-400 text-center leading-relaxed">
              {progress.stage === 'analyzing' && 'Analyzing your content...'}
              {progress.stage === 'generating' && 'Creating questions based on your topics...'}
              {progress.stage === 'saving' && 'Finalizing your quiz...'}
              {progress.stage === 'idle' && 'Processing...'}
            </p>

            <Progress
              value={progress.percent}
              className="h-1.5"
            />

            {progress.message && (
              <p className="text-xs text-stone-400 text-center">{progress.message}</p>
            )}
          </div>
        )}

        {progress.stage === 'error' && (
          <div className="space-y-4 py-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {progress.error || "Failed to generate quiz. Please try again."}
              </AlertDescription>
            </Alert>

            {progress.details && (
              <div className="text-xs p-3 bg-stone-100 border border-stone-200 rounded-xl overflow-auto max-h-40">
                <pre className="text-stone-500">{progress.details}</pre>
              </div>
            )}

            {onRetry && (
              <div className="flex justify-end">
                <button
                  onClick={onRetry}
                  className="px-6 py-2 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] transition-colors duration-150"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
