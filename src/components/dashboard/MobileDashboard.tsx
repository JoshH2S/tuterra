
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "./TasksList";
import { StudyCalendar } from "./StudyCalendar";
import { StatsCards } from "./StatsCards";
import { InsightsSection } from "./InsightsSection";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { CoursePerformanceCard } from "./CoursePerformanceCard";
import { useEffect } from "react";
import { useSwipeable } from "react-swipeable";

interface MobileDashboardProps {
  performance: any[];
  insights: any;
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: (data: any) => Promise<void>;
  openSessionDialog: () => void;
  onUpdateSession?: (id: string, updates: Partial<StudySession>) => Promise<void>;
}

export function MobileDashboard({ 
  performance, 
  insights, 
  sessions, 
  courses,
  onCreateSession,
  openSessionDialog,
  onUpdateSession
}: MobileDashboardProps) {
  // Always define the handler to avoid conditional hook usage
  const handleUpdateSession = onUpdateSession || ((id: string, updates: Partial<StudySession>) => Promise.resolve());
  
  // Use tabs state for swipe gestures
  const [activeTab, setActiveTab] = useState("overview");

  // Setup swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab === "overview") setActiveTab("calendar");
      else if (activeTab === "calendar") setActiveTab("insights");
    },
    onSwipedRight: () => {
      if (activeTab === "insights") setActiveTab("calendar");
      else if (activeTab === "calendar") setActiveTab("overview");
    },
    trackMouse: false
  });

  return (
    <div className="space-y-6" {...swipeHandlers}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="overview" className="py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="calendar" className="py-2.5">Calendar</TabsTrigger>
          <TabsTrigger value="insights" className="py-2.5">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatsCards performance={performance} />
          
          <CoursePerformanceCard performance={performance} />
          
          <TasksList 
            sessions={sessions} 
            courses={courses} 
            onCreateSession={openSessionDialog}
            onUpdateSession={handleUpdateSession}
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-6">
          <StudyCalendar 
            sessions={sessions} 
            onCreateSession={onCreateSession}
          />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <InsightsSection insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add the missing useState import
import { useState } from "react";
