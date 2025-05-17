
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Book, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTypeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: "standard" | "case-study") => void;
}

export function QuizTypeSelectionDialog({
  open,
  onOpenChange,
  onSelectType,
}: QuizTypeSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Quiz Type</DialogTitle>
          <DialogDescription>
            Select the type of quiz you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <button
            onClick={() => onSelectType("standard")}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200",
              "hover:border-primary/50 hover:bg-primary/5 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "touch-manipulation active:scale-[0.98]"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-medium">Standard Quiz</h3>
            <p className="text-sm text-center text-muted-foreground">
              Upload study materials and create customized quizzes based on the content
            </p>
          </button>

          <button
            onClick={() => onSelectType("case-study")}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200",
              "hover:border-primary/50 hover:bg-primary/5 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "touch-manipulation active:scale-[0.98]"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-700" />
            </div>
            <h3 className="text-lg font-medium">Case Study Quiz</h3>
            <p className="text-sm text-center text-muted-foreground">
              Create quizzes that connect course topics to real-world news and current events
            </p>
          </button>
        </div>

        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
