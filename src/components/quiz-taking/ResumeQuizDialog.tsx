
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookMarked, RefreshCw } from "lucide-react";

interface ResumeQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResume: () => void;
  onRestart: () => void;
  onClose: () => void;
  quizTitle: string;
  progress: number;
}

export function ResumeQuizDialog({
  open,
  onOpenChange,
  onResume,
  onRestart,
  onClose,
  quizTitle,
  progress,
}: ResumeQuizDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        onClose();
      }
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Quiz?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You have a saved progress for "{quizTitle}". 
              {progress > 0 && (
                <span className="font-medium"> You were on question {progress + 1}.</span>
              )}
            </p>
            <p>Would you like to resume from where you left off or start fresh?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose} className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRestart}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Fresh
          </AlertDialogAction>
          <AlertDialogAction onClick={onResume}>
            <BookMarked className="mr-2 h-4 w-4" />
            Resume
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
