
import { useState, useEffect } from "react";

/**
 * Hook that returns true if the window matches the given media query
 * @param query Media query string (e.g. "(max-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
  // Start with undefined during server-side rendering
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Define callback for media query change
    const handleResize = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener("change", handleResize);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [query]);

  return matches;
}

/**
 * Hook that returns true if the device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

/**
 * Hook that detects if the current device supports touch
 * @returns boolean indicating if the device has touch capabilities
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
