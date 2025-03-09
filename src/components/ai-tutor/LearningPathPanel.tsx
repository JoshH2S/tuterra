
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Lock, X } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
  isLocked: boolean;
  isPremiumOnly: boolean;
}

interface LearningPathPanelProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  subscriptionTier: "free" | "pro" | "premium";
  onClose?: () => void;
}

export const LearningPathPanel = ({
  activeStep,
  setActiveStep,
  subscriptionTier,
  onClose
}: LearningPathPanelProps) => {
  // Sample learning path steps
  const steps: Step[] = [
    {
      id: 0,
      title: "Topic Introduction",
      description: "Get familiar with the subject",
      isLocked: false,
      isPremiumOnly: false
    },
    {
      id: 1,
      title: "Key Concepts",
      description: "Understand fundamental ideas",
      isLocked: false,
      isPremiumOnly: false
    },
    {
      id: 2,
      title: "Interactive Examples",
      description: "Learn through examples",
      isLocked: activeStep < 1,
      isPremiumOnly: false
    },
    {
      id: 3,
      title: "Practice Problems",
      description: "Apply your knowledge",
      isLocked: activeStep < 2,
      isPremiumOnly: false
    },
    {
      id: 4,
      title: "Advanced Techniques",
      description: "Master complex approaches",
      isLocked: activeStep < 3,
      isPremiumOnly: true
    }
  ];

  const handleStepClick = (stepId: number, isLocked: boolean, isPremiumOnly: boolean) => {
    if (isLocked) return;
    if (isPremiumOnly && subscriptionTier === "free") return;
    setActiveStep(stepId);
    if (onClose) onClose();
  };

  return (
    <div className="h-full flex flex-col bg-muted/10 pt-2">
      {onClose && (
        <div className="px-4 mb-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 touch-manipulation"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="px-4 pb-3">
        <h2 className="text-sm font-semibold">Learning Path</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Progress through these steps to master the topic
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-1 px-2 pb-4">
          {steps.map((step) => {
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;
            const isDisabled = step.isLocked || (step.isPremiumOnly && subscriptionTier === "free");
            
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: step.id * 0.05 }}
                className="relative"
              >
                {step.id > 0 && (
                  <div 
                    className={`absolute left-[18px] top-[-8px] w-0.5 h-4 ${
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                )}
                
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left px-3 py-2 h-auto touch-manipulation ${
                    isDisabled ? "opacity-60" : ""
                  }`}
                  onClick={() => handleStepClick(step.id, step.isLocked, step.isPremiumOnly)}
                  disabled={isDisabled}
                >
                  <div className="flex items-center w-full">
                    <div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        isActive ? "bg-primary text-primary-foreground" : 
                        isCompleted ? "bg-primary/20 text-primary" : 
                        "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : step.isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-xs font-medium">{step.id + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm truncate">
                          {step.title}
                        </div>
                        <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground/70 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Button>
                
                {step.isPremiumOnly && subscriptionTier === "free" && (
                  <div className="absolute right-2 top-2 bg-amber-500/10 text-amber-500 text-xs font-medium px-1.5 py-0.5 rounded">
                    Premium
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
