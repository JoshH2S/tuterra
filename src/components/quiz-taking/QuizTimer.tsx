
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";

interface QuizTimerProps {
  timeRemaining: number | null;
  onTimeUp?: () => void;
  active?: boolean;
}

export const QuizTimer = ({ 
  timeRemaining, 
  onTimeUp, 
  active = false 
}: QuizTimerProps) => {
  const [time, setTime] = useState(timeRemaining);
  
  // Format remaining time for display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "No limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer effect
  useEffect(() => {
    setTime(timeRemaining);
    
    if (!active || timeRemaining === null) return;
    
    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === null) return null;
        
        if (prevTime <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeRemaining, active, onTimeUp]);
  
  const getTimerColor = () => {
    if (time === null) return "bg-gray-100 dark:bg-gray-800";
    if (time <= 60) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    if (time <= 180) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
    return "bg-gray-100 dark:bg-gray-800";
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getTimerColor()} transition-colors duration-300`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium text-xs sm:text-sm">
            {formatTime(time)}
          </span>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2 text-xs">
        Time remaining
      </HoverCardContent>
    </HoverCard>
  );
};
