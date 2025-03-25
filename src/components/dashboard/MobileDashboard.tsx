
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "./TasksList";
import { StudyCalendar } from "./StudyCalendar";
import { PerformanceOverview } from "./PerformanceOverview";
import { StatsCards } from "./StatsCards";
import { InsightsSection } from "./InsightsSection";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { NewsFeed } from "./NewsFeed";

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
  console.log('Mobile Dashboard mounting', { performance, insights });

  return (
    <div className="space-y-6 md:space-y-8">
      <NewsFeed courses={courses} />
      
      <StatsCards performance={performance} />
      
      {insights.length > 0 && (
        <InsightsSection insights={insights} />
      )}
      
      <div className="grid gap-6">
        <TasksList 
          sessions={sessions} 
          courses={courses} 
          onCreateSession={openSessionDialog}
          onUpdateSession={onUpdateSession}
        />
        
        <div className="space-y-6">
          <PerformanceOverview performance={performance} />
          
          <StudyCalendar 
            sessions={sessions}
            courses={courses}
            onCreateSession={onCreateSession}
          />
        </div>
      </div>
    </div>
  );
}
