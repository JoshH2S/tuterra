
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trophy, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, isLoading: isLoadingSessions } = useStudySessions();

  if (isLoading || isLoadingSessions) {
    return (
      <div className="container mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleCreateSession = async (sessionData: Omit<StudySession, 'id' | 'student_id'>) => {
    await createSession(sessionData);
  };

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and performance across all your courses
        </p>
      </div>

      {insights.length > 0 && (
        <div className="grid gap-4">
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
              <Alert key={index} className={bgColor}>
                <Icon className={`h-4 w-4 ${textColor}`} />
                <AlertDescription className={textColor}>
                  {insight.message}
                  {insight.metric && ` (${insight.metric.toFixed(1)}${insight.type === 'improvement' ? '%' : ''})`}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      <StudyCalendar 
        sessions={sessions}
        courses={courses}
        onCreateSession={handleCreateSession}
      />

      <PerformanceOverview performance={performance} />

      <div>
        <h2 className="text-2xl font-semibold mb-6">My Courses</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              performance={performance.find(p => p.course_id === course.course_id)}
            />
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>You are not enrolled in any courses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
