
import React from "react";
import { Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StepProgressProps {
  steps: {
    label: string;
    icon: LucideIcon;
  }[];
  currentStep: number;
}

export const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  return (
    <div className="hidden md:flex items-center">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  isComplete
                    ? "bg-[#C8A84B] text-white"
                    : isActive
                    ? "bg-[#091747] text-white"
                    : "bg-stone-200 text-stone-400"
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : `0${stepNum}`}
              </div>
              <span
                className={`text-[10px] tracking-widest uppercase font-medium hidden lg:block ${
                  isActive ? "text-[#091747]" : "text-stone-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-10 mx-3 mb-5 transition-colors duration-300 ${
                  currentStep > stepNum ? "bg-[#C8A84B]" : "bg-stone-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
