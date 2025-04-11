
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
  timeRemaining: number | null;
  onTimeUp?: () => void;
  active?: boolean;
}

export const QuizTimer = ({ timeRemaining, onTimeUp, active = true }: QuizTimerProps) => {
  const [localTime, setLocalTime] = useState(timeRemaining || 0);
  const [isRunning, setIsRunning] = useState(active);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine color based on remaining time
  const getTimerColor = (seconds: number) => {
    if (seconds <= 60) return "text-red-500";
    if (seconds <= 300) return "text-amber-500";
    return "text-gray-700 dark:text-gray-300";
  };

  useEffect(() => {
    // Sync with parent component time
    if (timeRemaining !== null) {
      setLocalTime(timeRemaining);
    }
  }, [timeRemaining]);

  useEffect(() => {
    setIsRunning(active);
  }, [active]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isRunning && localTime > 0) {
      timerId = setInterval(() => {
        setLocalTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timerId);
  }, [isRunning, localTime, onTimeUp]);

  if (timeRemaining === null) return null;

  return (
    <div className="inline-flex items-center py-2 px-4 bg-white dark:bg-gray-800 shadow-sm rounded-full">
      <Clock className="h-4 w-4 mr-2" />
      <span className={`font-medium ${getTimerColor(localTime)}`}>
        {formatTime(localTime)}
      </span>
    </div>
  );
};
