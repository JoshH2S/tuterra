
import { StudentPerformance } from "@/types/student";
import { StudySession } from "@/hooks/useStudySessions";
import { TasksList } from "@/components/dashboard/TasksList";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";
import { StudentCourse } from "@/types/student";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { CreateStudySessionData } from "@/types/study-sessions";

interface DesktopDashboardProps {
  performance: StudentPerformance[];
  insights: Array<{
    type: 'warning' | 'achievement' | 'improvement';
    message: string;
    metric?: number;
  }>;
  sessions: StudySession[];
  courses: StudentCourse[];
  createSession: (sessionData: Omit<StudySession, 'id' | 'student_id'>) => Promise<void>;
  children?: React.ReactNode;
  openSessionDialog: () => void;
}

export function DesktopDashboard({ 
  performance, 
  insights, 
  sessions, 
  courses,
  createSession,
  children,
  openSessionDialog
}: DesktopDashboardProps) {
  // Collect all strengths and areas for improvement across all courses
  const allStrengths = performance.flatMap(p => p.strengths || []);
  const allAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || []);
  
  // Remove duplicates
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)];

  return (
    <div className="space-y-8">
      {/* News Feed at the top */}
      {children}

      {/* Stats Cards */}
      <StatsCards performance={performance} />

      {/* Tasks Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksList 
          sessions={sessions} 
          courses={courses} 
          onCreateSession={openSessionDialog}
        />
      </section>

      {/* Insights Section */}
      <InsightsSection insights={insights} />

      {/* Performance Chart */}
      <section className="grid grid-cols-1 gap-6">
        <PerformanceChart performance={performance} />
      </section>

      {/* Strengths and Areas */}
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
