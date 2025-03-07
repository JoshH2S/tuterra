
import { motion } from "framer-motion";
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
    if (seconds === null) return "No limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium text-xs sm:text-sm">
            {formatTime(timeRemaining)}
          </span>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2 text-xs">
        Time remaining
      </HoverCardContent>
    </HoverCard>
  );
}
