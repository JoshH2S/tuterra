
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StudySessionDialog } from "@/components/dashboard/StudySessionDialog";
import { CreateStudySessionData } from "@/types/study-sessions";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";
import { InsightsSection } from "@/components/dashboard/InsightsSection";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, updateSession, isLoading: isLoadingSessions } = useStudySessions();
  const isMobile = useIsMobile();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset error state when data changes
    setError(null);
  }, [courses, performance, sessions]);

  const handleCreateSession = async (sessionData: CreateStudySessionData) => {
    try {
      await createSession(sessionData);
      setSessionDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create session'));
    }
  };

  const handleUpdateSession = async (id: string, updates: Partial<StudySession>) => {
    try {
      await updateSession(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update session'));
    }
  };

  const openSessionDialog = () => {
    setSessionDialogOpen(true);
  };

  // Extract unique strengths and areas for improvement
  const uniqueStrengths = Array.from(
    new Set(performance.flatMap(p => p.strengths || []))
  );
  
  const uniqueAreasForImprovement = Array.from(
    new Set(performance.flatMap(p => p.areas_for_improvement || []))
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 w-full max-w-full py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "An error occurred. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 w-full max-w-full">
        <DashboardHeader 
          title="My Dashboard" 
          description="Track your progress and performance across all your courses" 
        />

        <div className="space-y-4 sm:space-y-6">
          {/* News Feed at the top */}
          <NewsFeed courses={courses} />

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
            <>
              {/* Insights Section */}
              <InsightsSection insights={insights} />

              {/* Main Content Stack */}
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                <div className="space-y-6">
                  <PerformanceOverview performance={performance} />
                  
                  {(uniqueStrengths.length > 0 || uniqueAreasForImprovement.length > 0) && (
                    <StrengthsAndAreas 
                      strengths={uniqueStrengths} 
                      areasForImprovement={uniqueAreasForImprovement} 
                    />
                  )}

                  <StudyCalendar 
                    sessions={sessions}
                    onCreateSession={handleCreateSession}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <StudySessionDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
          onCreateSession={handleCreateSession}
        />
      </div>
    </ErrorBoundary>
  );
}
