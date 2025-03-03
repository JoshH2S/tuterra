
import React from "react";

interface QuizTimerDisplayProps {
  timeRemaining: number | null;
}

export const QuizTimerDisplay: React.FC<QuizTimerDisplayProps> = ({ timeRemaining }) => {
  // Format remaining time for display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "No time limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-right text-sm font-medium text-gray-500">
      Time remaining: {formatTime(timeRemaining)}
    </div>
  );
};
