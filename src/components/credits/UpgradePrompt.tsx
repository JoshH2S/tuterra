
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditsDisplay } from "./CreditsDisplay";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: "quiz" | "interview" | "assessment" | "tutor";
}

export const UpgradePrompt = ({ isOpen, onClose, featureType }: UpgradePromptProps) => {
  const featureLabels = {
    quiz: "quizzes",
    interview: "job interview simulations",
    assessment: "skill assessments",
    tutor: "AI tutor conversations"
  };

  const handleUpgradeClick = () => {
    // Navigate to subscription page or show subscription modal
    // For now, we'll just close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You're out of free credits</DialogTitle>
          <DialogDescription>
            You've used all your free {featureLabels[featureType]} credits. 
            Upgrade to continue using this feature and unlock all platform capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <CreditsDisplay showUpgradeButton={false} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Not Now
          </Button>
          <Button onClick={handleUpgradeClick}>
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
