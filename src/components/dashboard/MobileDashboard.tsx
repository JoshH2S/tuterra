
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "./TasksList";
import { StudyCalendar } from "./StudyCalendar";
import { StatsCards } from "./StatsCards";
import { InsightsSection } from "./InsightsSection";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { CoursePerformanceCard } from "./CoursePerformanceCard";

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
  // Ensure onUpdateSession is always a function, even if undefined is passed
  const handleUpdateSession = onUpdateSession || ((id: string, updates: Partial<StudySession>) => Promise.resolve());
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
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
