
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileInternshipHeader } from "./MobileInternshipHeader";
import { WelcomePanel } from "./WelcomePanel";
import { TaskOverview } from "./TaskOverview";
import { MessagingPanel } from "./MessagingPanel";
import { FeedbackCenter } from "./FeedbackCenter";
import { CalendarView } from "./CalendarView";
import { ResourceHub } from "./ResourceHub";
import { GamificationPanel } from "./GamificationPanel";
import { ExitActions } from "./ExitActions";

/**
 * A component that provides swipeable navigation between different
 * sections of the virtual internship dashboard on mobile devices.
 */
export function SwipeableInternshipView() {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState<string>("overview");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Views in the order they should appear
  const views = [
    "overview", "tasks", "messages", "feedback", 
    "calendar", "resources", "achievements", "exit"
  ];

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = views.indexOf(selectedView);
    
    if (isLeftSwipe && currentIndex < views.length - 1) {
      // Navigate to next view
      setSelectedView(views[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      // Navigate to previous view
      setSelectedView(views[currentIndex - 1]);
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Function to render the appropriate mobile view based on selection
  const renderMobileView = () => {
    switch (selectedView) {
      case "tasks":
        return <TaskOverview />;
      case "messages":
        return <MessagingPanel />;
      case "feedback":
        return <FeedbackCenter />;
      case "calendar":
        return <CalendarView />;
      case "resources":
        return <ResourceHub />;
      case "achievements":
        return <GamificationPanel />;
      case "exit":
        return <ExitActions />;
      default:
        return <WelcomePanel />;
    }
  };
  
  if (!isMobile) {
    // Render traditional layout for desktop
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <WelcomePanel />
          <MessagingPanel />
          <GamificationPanel />
        </div>
        
        <div className="space-y-6">
          <TaskOverview />
          <FeedbackCenter />
        </div>
        
        <div className="space-y-6">
          <CalendarView />
          <ResourceHub />
          <ExitActions />
        </div>
      </div>
    );
  }
  
  // Mobile view with touch events
  return (
    <div className="space-y-4">
      <MobileInternshipHeader 
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />
      <div 
        className="mb-16 touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderMobileView()}
      </div>
    </div>
  );
}
