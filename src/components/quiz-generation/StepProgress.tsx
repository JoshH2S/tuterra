
import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  steps: {
    label: string;
    icon: LucideIcon;
  }[];
  currentStep: number;
}

export const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  return (
    <div className="hidden md:flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = currentStep === index + 1;
        const isCompleted = currentStep > index + 1;
        const Icon = step.icon;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div 
                className={cn(
                  "h-px w-8", 
                  isCompleted ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
            <motion.div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                isActive && "bg-primary/10 text-primary",
                isCompleted && "text-primary",
                !isActive && !isCompleted && "text-gray-500"
              )}
              animate={{
                scale: isActive ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  isActive && "bg-primary text-white",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="hidden lg:inline">{step.label}</span>
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
