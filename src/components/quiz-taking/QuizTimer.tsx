
import { Timer } from "lucide-react";
import { useEffect } from "react";

interface QuizTimerProps {
  timeRemaining: number | null;
  onTimeUp: () => void;
}

export const QuizTimer = ({ timeRemaining, onTimeUp }: QuizTimerProps) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        if (timeRemaining <= 1) {
          clearInterval(timer);
          onTimeUp();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (timeRemaining === null) return null;

  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      <Timer className="h-5 w-5" />
      {formatTime(timeRemaining)}
    </div>
  );
};
