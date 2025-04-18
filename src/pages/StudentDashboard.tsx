import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions } from "@/hooks/useStudySessions";
import { StudySessionDialog } from "@/components/dashboard/StudySessionDialog";

export default function StudentDashboard() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, updateSession } = useStudySessions();
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  const firstName = user?.user_metadata?.first_name || "Student";
  
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
            onCreateSession={createSession}
            openSessionDialog={() => setIsSessionDialogOpen(true)}
            onUpdateSession={updateSession}
          />
        ) : (
          <DesktopDashboard 
            performance={performance} 
            insights={insights}
            sessions={sessions}
            courses={courses}
            createSession={createSession}
            openSessionDialog={() => setIsSessionDialogOpen(true)}
            updateSession={updateSession}
          />
        )}

        <StudySessionDialog 
          open={isSessionDialogOpen}
          onOpenChange={setIsSessionDialogOpen}
          onCreateSession={createSession}
          courses={courses}
        />
      </div>
    </div>
  );
}
