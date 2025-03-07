
import { cn } from "@/lib/utils";

interface QuestionDotProps {
  isActive: boolean;
  isAnswered: boolean;
}

export function QuestionDot({ isActive, isAnswered }: QuestionDotProps) {
  return (
    <div
      className={cn(
        "w-2.5 h-2.5 rounded-full transition-all",
        isActive ? "w-4 bg-primary" : isAnswered ? "bg-primary/60" : "bg-gray-300 dark:bg-gray-600"
      )}
    />
  );
}
