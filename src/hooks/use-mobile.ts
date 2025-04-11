
import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is a mobile device
 * based on screen width and touch capabilities
 * @returns boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect if the current device supports touch
 * @returns boolean indicating if the device supports touch
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if device supports touch
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
    
    setIsTouch(isTouchDevice);
  }, []);
  
  return isTouch;
}
