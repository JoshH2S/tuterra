
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
    tutor: "AI tutor messages"
  };

  const handleUpgradeClick = () => {
    // Navigate to subscription page or show subscription modal
    // For now, we'll just close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90%] w-full mx-auto">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl">You're out of free credits</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            You've used all your free {featureLabels[featureType]} credits. 
            Upgrade to continue using this feature and unlock all platform capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <CreditsDisplay showUpgradeButton={false} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Not Now
          </Button>
          <Button onClick={handleUpgradeClick} className="w-full sm:w-auto order-1 sm:order-2">
            Upgrade Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
