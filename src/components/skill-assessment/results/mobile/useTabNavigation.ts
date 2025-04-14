
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

export type MobileView = 'summary' | 'questions' | 'analysis';

export interface UseTabNavigationReturn {
  activeView: MobileView;
  swipeHandlers: ReturnType<typeof useSwipeable>;
  handleViewChange: (view: MobileView) => void;
  getDirection: (newView: string) => number;
  slideVariants: {
    enter: (direction: number) => {
      x: string;
      opacity: number;
    };
    center: {
      x: number;
      opacity: number;
      transition: {
        x: {
          type: string;
          stiffness: number;
          damping: number;
        };
        opacity: {
          duration: number;
        };
      };
    };
    exit: (direction: number) => {
      x: string;
      opacity: number;
      transition: {
        x: {
          type: string;
          stiffness: number;
          damping: number;
        };
        opacity: {
          duration: number;
        };
      };
    };
  };
}

export const useTabNavigation = (): UseTabNavigationReturn => {
  const [activeView, setActiveView] = useState<MobileView>('summary');
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };
  
  const getDirection = (newView: string) => {
    if (newView === 'summary' && activeView === 'questions') return -1;
    if (newView === 'analysis' && activeView === 'questions') return 1;
    if (newView === 'questions' && activeView === 'summary') return 1;
    if (newView === 'questions' && activeView === 'analysis') return -1;
    return 0;
  };
  
  const handleViewChange = (newView: MobileView) => {
    setActiveView(newView);
  };
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeView === 'summary') handleViewChange('questions');
      else if (activeView === 'questions') handleViewChange('analysis');
    },
    onSwipedRight: () => {
      if (activeView === 'analysis') handleViewChange('questions');
      else if (activeView === 'questions') handleViewChange('summary');
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
  });
  
  return {
    activeView,
    swipeHandlers,
    handleViewChange,
    getDirection,
    slideVariants
  };
};
