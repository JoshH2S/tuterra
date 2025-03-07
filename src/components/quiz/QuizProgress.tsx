
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  return (
    <div className="w-full max-w-xs">
      <Progress 
        value={(current / total) * 100}
        className="h-2 bg-secondary"
      />
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Question {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}% Complete</span>
      </div>
    </div>
  );
}
