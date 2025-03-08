
import React from "react";
import { StatsCard } from "./StatsCard";
import { CheckCircle, XCircle, ListChecks } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatsCardGridProps {
  correctAnswers: number;
  totalQuestions: number;
}

export function StatsCardGrid({ correctAnswers, totalQuestions }: StatsCardGridProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <StatsCard 
        title="Correct Answers"
        value={correctAnswers}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        className="bg-green-50 dark:bg-green-900/10"
        touchFeedback={isMobile}
      />
      <StatsCard 
        title="Total Questions"
        value={totalQuestions}
        icon={<ListChecks className="h-5 w-5 text-blue-500" />}
        className="bg-blue-50 dark:bg-blue-900/10"
        touchFeedback={isMobile}
      />
      <StatsCard 
        title="Incorrect Answers"
        value={totalQuestions - correctAnswers}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        className="bg-red-50 dark:bg-red-900/10"
        touchFeedback={isMobile}
      />
    </div>
  );
}
