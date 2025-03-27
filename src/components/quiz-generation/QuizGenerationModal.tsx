
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizGenerationModalProps {
  isOpen: boolean;
  progress: {
    stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
    percent: number;
    message: string;
    error?: string;
    details?: string;
  };
  onRetry?: () => void;
}

export function QuizGenerationModal({
  isOpen,
  progress,
  onRetry,
}: QuizGenerationModalProps) {
  const isGenerating = progress.stage !== 'idle' && progress.stage !== 'error';
  const hasError = progress.stage === 'error';

  // Function to format error details for display
  const formatErrorDetails = (details?: string) => {
    if (!details) return null;
    
    try {
      // Try to parse as JSON for better formatting
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not valid JSON, return as is
      return details;
    }
  };

  // Make error details expandable/collapsible
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Generating Quiz
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Generating Quiz
              </>
            )}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="text-sm">{progress.message}</div>
                <Progress value={progress.percent} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  This may take a minute. We're working with AI to create your questions.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium text-destructive">{progress.error || "An unexpected error occurred"}</div>
                
                {progress.details && (
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full text-xs"
                    >
                      {showDetails ? "Hide Error Details" : "Show Error Details"}
                    </Button>
                    
                    {showDetails && (
                      <div className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs font-mono">
                        {formatErrorDetails(progress.details)}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-sm">
                  This could be due to temporary issues with our generation service.
                  You can try again with the same settings or modify your topics.
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {hasError && onRetry && (
          <DialogFooter className="sm:justify-start">
            <Button onClick={onRetry} className="w-full sm:w-auto">
              Try Again
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
