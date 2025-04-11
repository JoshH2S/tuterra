
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
import { LogOut, Save } from "lucide-react";

interface QuizExitDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const QuizExitDialog: React.FC<QuizExitDialogProps> = ({
  open,
  onClose,
  onConfirmExit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exit Quiz?</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Your progress will be saved automatically when you exit. You can come back 
              and resume this quiz later from where you left off.
            </p>
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              Are you sure you want to exit this quiz now?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="sm:mr-2">
            Continue Quiz
          </Button>
          <Button 
            variant="default" 
            onClick={onConfirmExit}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save & Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
