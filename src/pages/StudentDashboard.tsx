
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { useMediaQuery } from "@/hooks/use-mobile";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions } from "@/hooks/useStudySessions";
import { StudySessionDialog } from "@/components/dashboard/StudySessionDialog";
import { CreateStudySessionData } from "@/types/study-sessions";

export default function StudentDashboard() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, updateSession } = useStudySessions();
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  const firstName = user?.user_metadata?.first_name || "Student";
  
  // Wrapper functions to handle the return types properly
  const handleCreateSession = async (sessionData: CreateStudySessionData): Promise<void> => {
    await createSession(sessionData);
  };
  
  const handleUpdateSession = async (id: string, updates: any): Promise<void> => {
    await updateSession(id, updates);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Student Dashboard" 
        description="Monitor your progress and upcoming tasks"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Add the welcome banner here */}
        <WelcomeBanner userName={firstName} />
        
        {/* Rest of the dashboard content */}
        {isMobile ? (
          <MobileDashboard 
            performance={performance} 
            insights={insights}
            sessions={sessions}
            courses={courses}
            onCreateSession={handleCreateSession}
            openSessionDialog={() => setIsSessionDialogOpen(true)}
            onUpdateSession={handleUpdateSession}
          />
        ) : (
          <DesktopDashboard 
            performance={performance} 
            insights={insights}
            sessions={sessions}
            courses={courses}
            createSession={handleCreateSession}
            openSessionDialog={() => setIsSessionDialogOpen(true)}
            updateSession={handleUpdateSession}
          />
        )}

        <StudySessionDialog 
          open={isSessionDialogOpen}
          onOpenChange={setIsSessionDialogOpen}
          onCreateSession={handleCreateSession}
          courses={courses}
        />
      </div>
    </div>
  );
}
