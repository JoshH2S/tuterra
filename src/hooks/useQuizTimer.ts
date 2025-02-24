
import { useState, useEffect } from "react";

export const useQuizTimer = (initialDuration: number) => {
  const [remainingTime, setRemainingTime] = useState<number>(initialDuration * 60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime]);

  return remainingTime;
};
