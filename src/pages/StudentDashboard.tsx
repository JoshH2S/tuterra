
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { StudySessionDialog } from "@/components/dashboard/StudySessionDialog";
import { CreateStudySessionData } from "@/types/study-sessions";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, updateSession, isLoading: isLoadingSessions } = useStudySessions();
  const isMobile = useIsMobile();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  useEffect(() => {
    console.log("Courses in StudentDashboard:", courses);
  }, [courses]);

  const handleCreateSession = async (sessionData: CreateStudySessionData) => {
    await createSession(sessionData);
    setSessionDialogOpen(false);
  };

  const handleUpdateSession = async (id: string, updates: Partial<StudySession>) => {
    await updateSession(id, updates);
  };

  const openSessionDialog = () => {
    setSessionDialogOpen(true);
  };

  // Extract unique strengths and areas for improvement across all courses
  const uniqueStrengths = performance.flatMap(p => p.strengths || [])
    .filter((item, index, self) => self.indexOf(item) === index);

  const uniqueAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || [])
    .filter((item, index, self) => self.indexOf(item) === index);

  if (isLoading || isLoadingSessions) {
    return (
      <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
      <DashboardHeader 
        title="My Dashboard" 
        description="Track your progress and performance across all your courses" 
      />

      {isMobile ? (
        <MobileDashboard
          performance={performance}
          insights={insights}
          sessions={sessions}
          courses={courses}
          onCreateSession={handleCreateSession}
          openSessionDialog={openSessionDialog}
          onUpdateSession={handleUpdateSession}
        />
      ) : (
        <div className="space-y-6">
          <NewsFeed courses={courses} />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PerformanceOverview performance={performance} />
              {(uniqueStrengths.length > 0 || uniqueAreasForImprovement.length > 0) && (
                <StrengthsAndAreas 
                  strengths={uniqueStrengths} 
                  areasForImprovement={uniqueAreasForImprovement} 
                />
              )}
            </div>
            <div className="space-y-6">
              <StudyCalendar 
                sessions={sessions}
                courses={courses}
                onCreateSession={handleCreateSession}
              />
            </div>
          </div>
        </div>
      )}

      <StudySessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}
