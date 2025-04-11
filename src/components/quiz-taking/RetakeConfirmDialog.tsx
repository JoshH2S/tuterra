
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

interface RetakeConfirmDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
  quizTitle: string;
  previousScore?: number;
}

export function RetakeConfirmDialog({
  open,
  onOpenChange,
  onClose,
  onConfirm,
  quizTitle,
  previousScore,
}: RetakeConfirmDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
    if (onOpenChange) onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Retake Quiz?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You have already completed "{quizTitle}".
              {previousScore !== undefined && (
                <span className="font-medium"> Your previous score was {previousScore}%.</span>
              )}
            </p>
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              Retaking this quiz will reset your current progress for this quiz.
            </p>
            <p>
              Your previous quiz results will be saved in your history, but the new attempt will 
              replace your current score on your dashboard.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Retake Quiz
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
