
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
import { Play, RefreshCw } from "lucide-react";

interface ResumeQuizDialogProps {
  open: boolean;
  onClose: () => void;
  onResume: () => void;
  onRestart: () => void;
  quizTitle: string;
}

export const ResumeQuizDialog: React.FC<ResumeQuizDialogProps> = ({
  open,
  onClose,
  onResume,
  onRestart,
  quizTitle,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resume Your Quiz</DialogTitle>
          <DialogDescription>
            You have an in-progress attempt for "{quizTitle}". Would you like to continue where you left off or start a new attempt?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Attempt
          </Button>
          <Button 
            onClick={onResume}
            className="bg-primary text-primary-foreground"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
