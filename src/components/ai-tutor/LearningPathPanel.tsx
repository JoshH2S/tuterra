
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
  steps = [],
  onClose
}: LearningPathPanelProps) => {
  // Ensure steps is an array and has items
  const validSteps = Array.isArray(steps) ? steps : [];
  const stepsLength = validSteps.length || 1; // Prevent division by zero
  
  const progress = Math.round(((activeStep + 1) / stepsLength) * 100);
  const isPaid = subscriptionTier !== "free";
  const isPremium = subscriptionTier === "premium";

  return (
    <div className="p-4 h-full overflow-auto bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Learning Path</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden" aria-label="Close panel">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {progress}% Complete
        </p>
      </div>

      <div className="space-y-3">
        {validSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = step.completed || index < activeStep;
          const isLocked = !isPaid && index > activeStep + 1;

          return (
            <motion.div
              key={index}
              className={cn(
                "relative p-3 rounded-lg border transition-all",
                isActive ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-muted/50",
                isLocked && "opacity-60"
              )}
              whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
              
              {isActive && isPremium && (
                <motion.div 
                  className="absolute -right-1 -top-1 bg-amber-500 text-[10px] text-white px-1.5 py-0.5 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Current
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!isPaid && (
        <motion.div 
          className="mt-6 p-4 bg-muted/50 border border-border/50 rounded-lg text-xs shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-2">Upgrade to unlock full learning path access</p>
          <Button size="sm" variant="default" className="w-full touch-manipulation">
            Upgrade Now
          </Button>
        </motion.div>
      )}
    </div>
  );
};
