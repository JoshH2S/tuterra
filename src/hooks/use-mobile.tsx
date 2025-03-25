
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobileWidth = 768; // md breakpoint
      const isMobileView = window.innerWidth < mobileWidth;
      console.log('Window width:', window.innerWidth, 'Is mobile:', isMobileView);
      setIsMobile(isMobileView);
    };

    // Initial check
    checkIsMobile();

    // Check on resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
