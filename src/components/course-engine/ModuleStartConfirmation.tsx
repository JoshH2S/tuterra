import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseModule } from "@/types/course-engine";
import { BookOpen, Clock, Sparkles } from "lucide-react";

interface ModuleStartConfirmationProps {
  open: boolean;
  module: CourseModule | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModuleStartConfirmation({
  open,
  module,
  onConfirm,
  onCancel,
}: ModuleStartConfirmationProps) {
  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ready to Start?
          </DialogTitle>
          <DialogDescription>
            You're about to begin a new module in your learning journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{module.title}</h4>
                {module.summary && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {module.summary}
                  </p>
                )}
                {module.estimated_minutes && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Estimated time: {module.estimated_minutes} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>We'll generate personalized lesson content just for you</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>This takes about 15-20 seconds</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary font-medium">•</span>
              <span>Once started, progress through the module at your own pace</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Not Yet
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            Start Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


