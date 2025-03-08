
import React from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreCircleProps {
  percentageScore: number;
}

export function ScoreCircle({ percentageScore }: ScoreCircleProps) {
  const isMobile = useIsMobile();
  
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Nice effort!";
    return "Keep practicing";
  };

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent rounded-2xl p-8">
      <div className="relative">
        <CircularProgress 
          percentage={percentageScore} 
          size={isMobile ? 200 : 240}
          strokeWidth={12}
          className="text-primary"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            {percentageScore}%
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getPerformanceMessage(percentageScore)}
          </span>
        </div>
      </div>
    </div>
  );
}
