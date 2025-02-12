
'use client'

import { Suspense, lazy, useEffect, useRef } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventEvent = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (isMobile) {
      // Prevent all gesture events on mobile
      container.addEventListener('wheel', preventEvent, { passive: false });
      container.addEventListener('touchstart', preventEvent, { passive: false });
      container.addEventListener('touchmove', preventEvent, { passive: false });
      container.addEventListener('gesturestart', preventEvent, { passive: false });
      container.addEventListener('gesturechange', preventEvent, { passive: false });
    }

    return () => {
      if (isMobile) {
        container.removeEventListener('wheel', preventEvent);
        container.removeEventListener('touchstart', preventEvent);
        container.removeEventListener('touchmove', preventEvent);
        container.removeEventListener('gesturestart', preventEvent);
        container.removeEventListener('gesturechange', preventEvent);
      }
    };
  }, [isMobile]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        touchAction: isMobile ? 'none' : 'auto',
        userSelect: 'none'
      }}
    >
      <Suspense 
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline
          scene={scene}
          className={className}
        />
      </Suspense>
    </div>
  )
}
