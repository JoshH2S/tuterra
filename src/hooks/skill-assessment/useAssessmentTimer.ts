
import { useEffect } from "react";

export const useAssessmentTimer = (
  timeRemaining: number,
  setTimeRemaining: (value: number) => void,
  isActive: boolean,
  onTimeout: () => void
) => {
  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !isActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, isActive, setTimeRemaining, onTimeout]);
};
