import { useMemo } from "react";
import { Clock } from "lucide-react";

interface AssessmentHeaderProps {
  title: string;
  timeRemaining: number;
  level?: string;
}

export const AssessmentHeader = ({ title, timeRemaining, level }: AssessmentHeaderProps) => {
  const formatTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const remainingSeconds = timeRemaining % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, [timeRemaining]);

  const timerColor =
    timeRemaining <= 60
      ? "text-red-500 border-red-200 bg-red-50"
      : timeRemaining <= 180
      ? "text-amber-600 border-amber-200 bg-amber-50"
      : "text-gray-600 border-gray-200 bg-white";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-lg md:text-xl font-medium text-gray-900 truncate">{title}</h1>
        {level && (
          <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
            {level}
          </span>
        )}
      </div>

      <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${timerColor}`}>
        <Clock className="h-3.5 w-3.5" />
        <span>{formatTime}</span>
      </div>
    </div>
  );
};
