
import { LockIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PremiumCard } from "@/components/ui/premium-card";

type FeatureTier = "pro" | "premium" | "free";

interface FeatureLockProps {
  children: React.ReactNode;
  tier?: FeatureTier;
  userTier?: string;
  featureType: "quiz" | "interview" | "assessment" | "tutor";
  className?: string;
  showMessage?: boolean;
}

export const FeatureLock = ({
  children,
  tier = "premium",
  userTier = "free",
  featureType,
  className,
  showMessage = true,
}: FeatureLockProps) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Check if the feature should be locked
  const isLocked = tier === "premium" && userTier !== "premium" ||
                  tier === "pro" && userTier !== "pro" && userTier !== "premium";

  const featureLabels = {
    quiz: "quizzes",
    interview: "job interview simulations",
    assessment: "skill assessments",
    tutor: "AI tutor conversations"
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div className={cn("relative group", className)}>
        <div className="opacity-60">{children}</div>
        
        <div
          className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-lg"
          onClick={handleClick}
        >
          <div className="flex flex-col items-center p-4 text-center">
            <div className="bg-muted rounded-full p-3 mb-3">
              <LockIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {showMessage && (
              <p className="text-sm text-muted-foreground mb-3 max-w-[200px]">
                {tier === "premium" 
                  ? "This is a Premium feature" 
                  : "This feature requires Pro plan or higher"}
              </p>
            )}
            
            <Button 
              size="sm" 
              variant="default" 
              className="gap-1"
              onClick={handleClick}
            >
              <Sparkles className="w-3 h-3" />
              <span>Upgrade</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Upgrade to {tier === "premium" ? "Premium" : "Pro"}</span>
            </DialogTitle>
            <DialogDescription>
              Get unlimited access to all {featureLabels[featureType]} and more premium features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <PremiumCard variant="minimal" className="p-4">
              <h3 className="font-medium mb-2">What you'll get:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Unlimited {featureLabels[featureType]}</span>
                </li>
                {tier === "premium" && (
                  <>
                    <li className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Advanced AI models and features</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Priority support</span>
                    </li>
                  </>
                )}
              </ul>
            </PremiumCard>
          </div>

          <DialogFooter className="flex sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              Not now
            </Button>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
