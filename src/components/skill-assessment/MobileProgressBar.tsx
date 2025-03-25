
import { Circle, CheckCircle } from "lucide-react";

interface MobileProgressBarProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}

export const MobileProgressBar = ({
  progress,
  currentQuestion,
  totalQuestions
}: MobileProgressBarProps) => {
  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {currentQuestion > 1 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">Question {currentQuestion} of {totalQuestions}</span>
        </div>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};
