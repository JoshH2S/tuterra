
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useMemo } from "react";

interface QuestionProgressProps {
  currentIndex: number;
  totalQuestions: number;
  estimatedTimeSeconds?: number;
  isFinalQuestion: boolean;
}

export const QuestionProgress = ({ 
  currentIndex, 
  totalQuestions,
  estimatedTimeSeconds,
  isFinalQuestion
}: QuestionProgressProps) => {
  const progressPercentage = useMemo(() => 
    Math.floor(((currentIndex + 1) / totalQuestions) * 100),
    [currentIndex, totalQuestions]
  );
  
  const formattedTime = useMemo(() => {
    if (!estimatedTimeSeconds) return null;
    
    const minutes = Math.floor(estimatedTimeSeconds / 60);
    const seconds = estimatedTimeSeconds % 60;
    
    return minutes > 0 
      ? `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`
      : `${seconds}s`;
  }, [estimatedTimeSeconds]);

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex gap-1 items-center">
          <span className={isFinalQuestion ? "font-semibold text-primary" : ""}>
            Question {currentIndex + 1}/{totalQuestions}
          </span>
          {isFinalQuestion && <span className="text-primary font-medium">(Final)</span>}
        </div>
        
        {formattedTime && (
          <div className="flex items-center gap-1 text-muted-foreground" aria-label={`Suggested time: ${formattedTime}`}>
            <Clock className="h-3 w-3" />
            <span>{formattedTime}</span>
          </div>
        )}
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-1" 
        indicatorClassName={isFinalQuestion ? "bg-primary" : ""}
        aria-label={`Interview progress: ${progressPercentage}%`}
      />
    </div>
  );
};
