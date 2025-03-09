
import { useMemo } from "react";

interface AssessmentHeaderProps {
  title: string;
  timeRemaining: number;
  level?: string;
}

export const AssessmentHeader = ({ 
  title, 
  timeRemaining, 
  level 
}: AssessmentHeaderProps) => {
  const formatTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const remainingSeconds = timeRemaining % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center text-muted-foreground">
          <span className="font-medium">{formatTime}</span>
        </div>
        {level && (
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
            {level} level
          </div>
        )}
      </div>
    </div>
  );
};
