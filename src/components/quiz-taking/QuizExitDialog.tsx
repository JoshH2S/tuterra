
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
            Your progress will be saved so you can return later. You can resume this quiz from where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Continue Quiz
          </Button>
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onConfirmExit}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
