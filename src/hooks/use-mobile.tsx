
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
