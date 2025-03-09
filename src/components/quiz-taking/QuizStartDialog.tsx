
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface QuizStartDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const QuizStartDialog = ({ open, onClose, onStart }: QuizStartDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ready to start your quiz?</DialogTitle>
          <DialogDescription>
            When you press the Start button, the timer will begin and you can start answering questions.
            Take your time to read each question carefully.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button 
            variant="default" 
            onClick={onStart}
            className="w-full sm:w-auto"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
