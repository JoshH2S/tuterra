
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
  percent: number;
  message: string;
  error?: string;
}

interface QuizGenerationModalProps {
  isOpen: boolean;
  progress: GenerationProgress;
}

export const QuizGenerationModal = ({ isOpen, progress }: QuizGenerationModalProps) => {
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
                <div className="w-full p-4 bg-destructive/10 rounded-md text-sm text-destructive">
                  {progress.error}
                </div>
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
                <Progress value={progress.percent} />
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
