
import { cn } from "@/lib/utils";

interface QuestionDotProps {
  isActive: boolean;
  isAnswered: boolean;
  onClick?: () => void;
}

export function QuestionDot({ isActive, isAnswered, onClick }: QuestionDotProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-2 h-2 rounded-full transition-all touch-manipulation",
        onClick && "cursor-pointer",
        isActive ? "w-3 bg-primary" : isAnswered ? "bg-primary/60" : "bg-gray-300 dark:bg-gray-600"
      )}
      type="button"
      aria-label={isActive ? "Current question" : isAnswered ? "Answered question" : "Unanswered question"}
    />
  );
}
