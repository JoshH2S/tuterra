
import { Clock } from "lucide-react";

interface InterviewTimerProps {
  timeLeft: number | null;
}

export const InterviewTimer = ({ timeLeft }: InterviewTimerProps) => {
  if (timeLeft === null) return null;
  
  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="flex items-center gap-1 text-muted-foreground px-2 py-1 rounded-full bg-muted/20 text-sm">
      <Clock className="h-4 w-4" />
      <span>{formattedTime}</span>
    </div>
  );
};
