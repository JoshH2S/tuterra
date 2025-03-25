
import { PerformanceChart } from "./PerformanceChart";
import { StatsCards } from "./StatsCards";
import { InsightsSection } from "./InsightsSection";
import { TasksList } from "./TasksList";
import { StudyCalendar } from "./StudyCalendar";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { ReactNode } from "react";
import { StrengthsAndAreas } from "./StrengthsAndAreas";

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
  console.log('Desktop Dashboard mounting', { performance, insights });
  
  const allStrengths = performance.flatMap(p => p.strengths || []);
  const allAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || []);
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)];

  return (
    <div className="space-y-8">
      {children}
      <StatsCards performance={performance} />
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksList 
          sessions={sessions} 
          courses={courses} 
          onCreateSession={openSessionDialog}
          onUpdateSession={updateSession}
        />
        <StudyCalendar 
          sessions={sessions}
          courses={courses}
          onCreateSession={createSession}
        />
      </section>
      
      <InsightsSection insights={insights} />
      
      <section className="grid grid-cols-1 gap-6">
        <PerformanceChart performance={performance} />
      </section>
      
      {(uniqueStrengths.length > 0 || uniqueAreasForImprovement.length > 0) && (
        <section>
          <StrengthsAndAreas 
            strengths={uniqueStrengths} 
            areasForImprovement={uniqueAreasForImprovement} 
          />
        </section>
      )}
    </div>
  );
}
