
import { Clock } from "lucide-react";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";

interface QuizTimerProps {
  timeRemaining: number | null;
}

export function QuizTimer({ timeRemaining }: QuizTimerProps) {
  // Format remaining time for display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "No time limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
          <Clock className="w-4 h-4" />
          <span className="font-medium">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent>
        Time remaining for this quiz
      </HoverCardContent>
    </HoverCard>
  );
}
