
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SubscriptionTier } from "@/hooks/useSubscription";

interface Step {
  title: string;
  completed: boolean;
}

interface LearningPathPanelProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  subscriptionTier: SubscriptionTier;
  steps: Step[];
  onClose?: () => void;
}

export const LearningPathPanel = ({
  activeStep,
  setActiveStep,
  subscriptionTier,
  steps,
  onClose
}: LearningPathPanelProps) => {
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);
  const isPaid = subscriptionTier !== "free";

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Learning Path</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {progress}% Complete
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isLocked = !isPaid && index > activeStep + 1;

          return (
            <motion.div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                isActive ? "bg-primary/5 border-primary/30" : "bg-background",
                isLocked && "opacity-60"
              )}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              onClick={() => {
                if (!isLocked && isPaid) {
                  setActiveStep(index);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Circle className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  )}
                </div>
                <span className={cn("text-sm", isActive && "font-medium")}>{step.title}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isPaid && (
        <div className="mt-6 p-3 bg-muted rounded-lg text-xs text-center">
          <p className="mb-2">Upgrade to unlock full learning path access</p>
          <Button size="sm" variant="default" className="w-full">
            Upgrade Now
          </Button>
        </div>
      )}
    </div>
  );
};
