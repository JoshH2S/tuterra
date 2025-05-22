
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { WelcomePanel } from "@/components/internship/WelcomePanel";
import { TaskOverview } from "@/components/internship/TaskOverview";
import { MessagingPanel } from "@/components/internship/MessagingPanel";
import { FeedbackCenter } from "@/components/internship/FeedbackCenter";
import { CalendarView } from "@/components/internship/CalendarView";
import { ResourceHub } from "@/components/internship/ResourceHub";
import { GamificationPanel } from "@/components/internship/GamificationPanel";
import { ExitActions } from "@/components/internship/ExitActions";
import { MobileInternshipHeader } from "@/components/internship/MobileInternshipHeader";

export default function VirtualInternshipDashboard() {
  const isMobile = useIsMobile();
  const [selectedView, setSelectedView] = useState<string>("overview");

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

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {isMobile ? (
        <div className="space-y-4">
          <MobileInternshipHeader 
            selectedView={selectedView}
            setSelectedView={setSelectedView}
          />
          <div className="mb-16">
            {renderMobileView()}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 1/3 width on large screens */}
          <div className="space-y-6">
            <WelcomePanel />
            <MessagingPanel />
            <GamificationPanel />
          </div>
          
          {/* Middle column - 1/3 width on large screens */}
          <div className="space-y-6">
            <TaskOverview />
            <FeedbackCenter />
          </div>
          
          {/* Right column - 1/3 width on large screens */}
          <div className="space-y-6">
            <CalendarView />
            <ResourceHub />
            <ExitActions />
          </div>
        </div>
      )}
    </div>
  );
}
