
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index + 1 === currentStep 
              ? "bg-primary w-6" 
              : index + 1 < currentStep 
                ? "bg-primary/60 w-4" 
                : "bg-gray-300 dark:bg-gray-700 w-4"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          layoutId={`step-${index}`}
        />
      ))}
    </div>
  );
};
