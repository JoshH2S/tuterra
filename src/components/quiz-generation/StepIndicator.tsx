
import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1;
        const isComplete = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={i}>
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
            {i < totalSteps - 1 && (
              <div
                className={`h-px w-8 mx-2 transition-colors duration-300 ${
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
