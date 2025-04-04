
import { useMemo } from "react";
import { Clock } from "lucide-react";

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
    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
      <h1 className="text-xl md:text-2xl font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200">{title}</h1>
      <div className="flex flex-row items-center justify-between md:justify-end gap-4">
        <div className="flex items-center text-muted-foreground">
          <Clock className="mr-1.5 h-4 w-4" />
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
