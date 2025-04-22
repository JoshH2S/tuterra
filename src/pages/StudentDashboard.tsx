
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StudySessionDialog } from "@/components/dashboard/StudySessionDialog";
import { CreateStudySessionData } from "@/types/study-sessions";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function StudentDashboard() {
  // Move all hook calls to the top level
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

  // Extract unique strengths and areas for improvement - moved outside any conditional return
  const uniqueStrengths = Array.from(
    new Set(performance.flatMap(p => p.strengths || []))
  );
  
  const uniqueAreasForImprovement = Array.from(
    new Set(performance.flatMap(p => p.areas_for_improvement || []))
  );

  // Loading state - use a separate JSX element for this rather than a conditional return
  if (isLoading || isLoadingSessions) {
    return (
      <div className="container mx-auto px-4 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 sm:h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main content - only reached after all hooks are evaluated
  return (
    <div className="container mx-auto px-4 w-full max-w-full">
      <DashboardHeader 
        title="My Dashboard" 
        description="Track your progress and performance across all your courses" 
      />

      <div className="space-y-4 sm:space-y-6">
        {/* News Feed at the top */}
        <NewsFeed courses={courses} />

        <ErrorBoundary>
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
            <DesktopDashboard 
              performance={performance}
              insights={insights}
              sessions={sessions}
              courses={courses}
              createSession={handleCreateSession}
              openSessionDialog={openSessionDialog}
              updateSession={handleUpdateSession}
            />
          )}
        </ErrorBoundary>
      </div>

      <StudySessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        onCreateSession={handleCreateSession}
      />
    </div>
  );
}
