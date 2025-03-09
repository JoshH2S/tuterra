
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
          <DialogDescription>
            Warning: If you exit now, you will lose your progress. Are you sure you want to leave this quiz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Continue Quiz
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirmExit}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
