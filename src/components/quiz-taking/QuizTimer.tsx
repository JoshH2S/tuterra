
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizTimerProps {
  timeRemaining: number | null;
  onTimeUp: () => void;
  active?: boolean;
}

export const QuizTimer = ({ timeRemaining, onTimeUp, active = true }: QuizTimerProps) => {
  const [currentTime, setCurrentTime] = useState<number | null>(timeRemaining);
  
  useEffect(() => {
    setCurrentTime(timeRemaining);
  }, [timeRemaining]);
  
  useEffect(() => {
    if (!active || currentTime === null || currentTime <= 0) return;
    
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTime, onTimeUp, active]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (currentTime === null) return null;

  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      <Timer className="h-5 w-5" />
      {formatTime(currentTime)}
    </div>
  );
};
