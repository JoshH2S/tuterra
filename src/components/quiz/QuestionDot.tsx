
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuestionDotProps {
  isActive: boolean;
  isAnswered: boolean;
  onClick?: () => void;
}

export function QuestionDot({ isActive, isAnswered, onClick }: QuestionDotProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "w-2.5 h-2.5 rounded-full transition-all touch-manipulation",
        onClick && "cursor-pointer",
        isActive ? "ring-2 ring-primary ring-offset-2" : "",
        isAnswered ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      )}
      type="button"
      aria-label={isActive ? "Current question" : isAnswered ? "Answered question" : "Unanswered question"}
    />
  );
}
