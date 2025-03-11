
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { StudySession } from "@/hooks/useStudySessions";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trophy, TrendingUp } from "lucide-react";
import { StudentCourse } from "@/types/student";
import { TasksList } from "@/components/dashboard/TasksList";
import { CreateStudySessionData } from "@/types/study-sessions";

interface MobileDashboardProps {
  performance: ReturnType<typeof useStudentDashboard>["performance"];
  insights: ReturnType<typeof useStudentAnalytics>["insights"];
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: (sessionData: CreateStudySessionData) => Promise<void>;
  openSessionDialog: () => void;
}

export function MobileDashboard({ 
  performance, 
  insights, 
  sessions, 
  courses,
  onCreateSession,
  openSessionDialog
}: MobileDashboardProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      <NewsFeed courses={courses} />

      {insights.length > 0 && (
        <div className="grid gap-3">
          {insights.map((insight, index) => {
            const Icon = insight.type === 'warning' 
              ? AlertTriangle 
              : insight.type === 'achievement' 
                ? Trophy 
                : TrendingUp;

            const bgColor = insight.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : insight.type === 'achievement'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200';

            const textColor = insight.type === 'warning'
              ? 'text-yellow-600'
              : insight.type === 'achievement'
                ? 'text-green-600'
                : 'text-blue-600';

            return (
              <Alert key={index} className={`${bgColor} p-3`}>
                <Icon className={`h-4 w-4 ${textColor}`} />
                <AlertDescription className={`${textColor} text-sm`}>
                  {insight.message}
                  {insight.metric && ` (${insight.metric.toFixed(1)}${insight.type === 'improvement' ? '%' : ''})`}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      <div className="grid gap-6">
        <TasksList 
          sessions={sessions} 
          courses={courses} 
          onCreateSession={openSessionDialog}
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
