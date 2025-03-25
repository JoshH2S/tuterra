
import { useState, useEffect } from "react";

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const newIsMobile = window.innerWidth < breakpoint;
      setIsMobile(newIsMobile);
      console.log(`Window width: ${window.innerWidth}, isMobile: ${newIsMobile}`);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
};

// Add the useTouchDevice hook that's being imported but was missing
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if the device supports touch events
    const isTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - This property exists in some browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouch(isTouchDevice());
    
    // Log touch capability detection for debugging
    console.log(`Touch device detected: ${isTouchDevice()}`);
  }, []);

  return isTouch;
};
