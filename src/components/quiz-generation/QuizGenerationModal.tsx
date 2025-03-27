
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {progress.stage === 'error' ? 'Error Generating Quiz' : 'Generating Quiz'}
          </DialogTitle>
          <DialogDescription>
            {progress.stage === 'error' 
              ? 'There was a problem generating your quiz. You can try again or adjust your input.'
              : 'Please wait while we process your content and generate questions.'}
          </DialogDescription>
        </DialogHeader>

        {progress.stage !== 'error' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Info size={16} />
              <span>
                {progress.stage === 'analyzing' && 'Analyzing your content...'}
                {progress.stage === 'generating' && 'Creating questions based on your topics...'}
                {progress.stage === 'saving' && 'Finalizing your quiz...'}
                {progress.stage === 'idle' && 'Processing...'}
              </span>
            </div>

            <Progress 
              value={progress.percent} 
              className="h-2" 
              indicatorClassName={getProgressColor()} 
            />
            
            <p className="text-sm text-center mt-2">
              {progress.message}
            </p>
            
            {progress.stage === 'generating' && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {progress.stage === 'error' && (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {progress.error || "Failed to generate quiz. Please try again."}
              </AlertDescription>
            </Alert>

            {progress.details && (
              <div className="mt-4 text-xs p-3 bg-muted rounded-md overflow-auto max-h-40">
                <pre>{progress.details}</pre>
              </div>
            )}

            {onRetry && (
              <div className="flex justify-end mt-4">
                <Button onClick={onRetry}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
