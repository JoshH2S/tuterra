
import { useEffect, useState } from "react";

/**
 * Hook that provides responsive breakpoint information
 * - Detects screen size changes
 * - Provides platform-specific boolean values
 * - Returns appropriate variants based on screen size
 */
export function useResponsive() {
  // Initialize with undefined to avoid hydration mismatch
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined);
  const [isTablet, setIsTablet] = useState<boolean | undefined>(undefined);
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Set up media queries
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const tabletQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    // Update state based on current match
    const updateMatches = () => {
      setIsDesktop(desktopQuery.matches);
      setIsTablet(tabletQuery.matches);
      setIsMobile(mobileQuery.matches);
    };

    // Initial update
    updateMatches();

    // Set up listeners for each media query
    desktopQuery.addEventListener("change", updateMatches);
    tabletQuery.addEventListener("change", updateMatches);
    mobileQuery.addEventListener("change", updateMatches);

    // Cleanup
    return () => {
      desktopQuery.removeEventListener("change", updateMatches);
      tabletQuery.removeEventListener("change", updateMatches);
      mobileQuery.removeEventListener("change", updateMatches);
    };
  }, []);

  return {
    isDesktop,
    isTablet,
    isMobile,
    // Return appropriate variants based on screen size
    getVariant: () => {
      if (isDesktop) return "desktop";
      if (isTablet) return "tablet";
      return "mobile";
    },
  };
}
