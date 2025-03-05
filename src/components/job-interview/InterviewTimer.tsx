
import { Clock } from "lucide-react";

interface InterviewTimerProps {
  timeLeft: number | null;
}

export const InterviewTimer = ({ timeLeft }: InterviewTimerProps) => {
  if (timeLeft === null) return null;
  
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
    </div>
  );
};
