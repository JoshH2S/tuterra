
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface GenerateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  topicsCount?: number;
  questionsCount?: number;
}

export function GenerateQuizDialog({
  open,
  onOpenChange,
  onConfirm,
  topicsCount = 0,
  questionsCount = 0,
}: GenerateQuizDialogProps) {
  // Track if confirmation has been clicked to prevent double-showing
  const handleConfirm = () => {
    onConfirm();
    // Close the dialog immediately after confirmation to prevent reopening
    onOpenChange(false);
  };

  // If dialog is closed by escape key or clicking outside, ensure we clean up
  useEffect(() => {
    if (!open) {
      // No cleanup needed, just ensure we respect the closed state
      console.log("Quiz generation dialog closed");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Important Notice
          </DialogTitle>
          <DialogDescription className="pt-2">
            {topicsCount > 0 && questionsCount > 0 ? (
              <>
                You are about to generate a quiz with {questionsCount} questions 
                on {topicsCount} {topicsCount === 1 ? 'topic' : 'topics'}.
              </>
            ) : null}
            <div className="mt-2">
              Our platform utilizes AI technology to generate quiz questions and answers. 
              While we aim to provide accurate and helpful content, AI systems can sometimes 
              produce errors or inaccuracies. We encourage users to verify information 
              independently and consult trusted sources where necessary.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="touch-manipulation"
          >
            I Understand, Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
