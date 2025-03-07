
import { useEffect, RefObject } from "react";
import { useMotionValue, MotionValue } from "framer-motion";

interface GestureResult {
  x: MotionValue<number>;
  y: MotionValue<number>;
  swipeDistance: MotionValue<number>;
  swipeDirection: MotionValue<"none" | "left" | "right" | "up" | "down">;
  isSwipeComplete: MotionValue<boolean>;
}

export function useMobileGestures(ref: RefObject<HTMLElement>): GestureResult {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const swipeDistance = useMotionValue(0);
  const swipeDirection = useMotionValue<"none" | "left" | "right" | "up" | "down">("none");
  const isSwipeComplete = useMotionValue(false);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    const swipeThreshold = 80; // Minimum distance for a swipe
    const swipeTimeThreshold = 300; // Maximum time for a swipe in ms

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      swipeDirection.set("none");
      isSwipeComplete.set(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      x.set(deltaX);
      y.set(deltaY);
      swipeDistance.set(distance);
      
      // Determine swipe direction during movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        swipeDirection.set(deltaX > 0 ? "right" : "left");
      } else {
        swipeDirection.set(deltaY > 0 ? "down" : "up");
      }
    };

    const handleTouchEnd = () => {
      const endTime = Date.now();
      const timeDiff = endTime - startTime;
      const currentDistance = swipeDistance.get();
      
      // Check if it's a valid swipe
      if (currentDistance > swipeThreshold && timeDiff < swipeTimeThreshold) {
        isSwipeComplete.set(true);
      } else {
        // Reset values if not a complete swipe
        swipeDirection.set("none");
      }
      
      // Reset motion values
      x.set(0);
      y.set(0);
      swipeDistance.set(0);
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, x, y, swipeDistance, swipeDirection, isSwipeComplete]);

  return { x, y, swipeDistance, swipeDirection, isSwipeComplete };
}
