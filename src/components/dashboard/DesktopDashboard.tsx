
import { StatsCards } from "./StatsCards";
import { InsightsSection } from "./InsightsSection";
import { TasksList } from "./TasksList";
import { StudyCalendar } from "./StudyCalendar";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { ReactNode } from "react";
import { PerformanceChart } from "./PerformanceChart";

interface DesktopDashboardProps {
  performance: any[];
  insights: any;
  sessions: StudySession[];
  courses: StudentCourse[];
  children?: ReactNode;
  createSession: (data: any) => Promise<void>;
  openSessionDialog: () => void;
  updateSession?: (id: string, updates: Partial<StudySession>) => Promise<void>;
}

export function DesktopDashboard({ 
  performance, 
  insights, 
  sessions, 
  courses, 
  children,
  createSession,
  openSessionDialog,
  updateSession
}: DesktopDashboardProps) {
  const allStrengths = performance.flatMap(p => p.strengths || []);
  const allAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || []);
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)];

  return (
    <div className="space-y-6">
      <StatsCards performance={performance} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-6 col-span-1 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceChart performance={performance} />
            <TasksList 
              sessions={sessions} 
              courses={courses} 
              onCreateSession={openSessionDialog}
              onUpdateSession={updateSession}
            />
          </div>
          
          <StudyCalendar 
            sessions={sessions} 
            courses={courses} 
            onCreateSession={createSession}
          />
        </div>
        
        <div className="space-y-6">
          <InsightsSection insights={insights} />
          {children}
        </div>
      </div>
    </div>
  );
}
