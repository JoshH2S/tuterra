
import { useState, useEffect } from "react";

export const useQuizTimer = (
  initialDuration: number | null,
  onTimeUp: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    initialDuration ? initialDuration * 60 : null
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  return { timeRemaining };
};
