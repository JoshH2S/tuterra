
import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check immediately
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

// Add touch interaction detection
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    // Check if device supports touch
    const checkTouchDevice = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0
      );
    };
    
    checkTouchDevice();
  }, []);
  
  return isTouch;
};
