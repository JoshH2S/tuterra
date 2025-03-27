
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
  percent: number;
  message: string;
  error?: string;
  details?: string;
}

interface QuizGenerationModalProps {
  isOpen: boolean;
  progress: GenerationProgress;
  onRetry?: () => void;
}

export const QuizGenerationModal = ({ isOpen, progress, onRetry }: QuizGenerationModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6 py-6">
          {progress.stage === 'error' ? (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Generation Failed</h3>
              <p className="text-center text-muted-foreground">{progress.message}</p>
              
              {progress.error && (
                <ScrollArea className="w-full max-h-40 p-4 bg-destructive/10 rounded-md">
                  <div className="text-sm text-destructive whitespace-pre-wrap">
                    {progress.error}
                  </div>
                </ScrollArea>
              )}
              
              {progress.details && (
                <details className="w-full">
                  <summary className="text-sm cursor-pointer mb-2">Technical Details</summary>
                  <ScrollArea className="w-full max-h-28 p-3 bg-muted rounded-md">
                    <div className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                      {progress.details}
                    </div>
                  </ScrollArea>
                </details>
              )}
              
              {onRetry && (
                <Button 
                  onClick={onRetry}
                  className="w-full sm:w-auto mt-2"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">Generating Your Quiz</h3>
                <p className="text-center text-muted-foreground">{progress.message}</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={progress.percent} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress.percent}% Complete
                </p>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {progress.stage === 'analyzing' && "Analyzing content and extracting key concepts..."}
                {progress.stage === 'generating' && "Generating questions based on your topics..."}
                {progress.stage === 'saving' && "Saving quiz and finalizing..."}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
