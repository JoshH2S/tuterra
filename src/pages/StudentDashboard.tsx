
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trophy, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, isLoading: isLoadingSessions } = useStudySessions();
  const isMobile = useIsMobile();

  if (isLoading || isLoadingSessions) {
    return (
      <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Collect all strengths and areas for improvement across all courses
  const allStrengths = performance.flatMap(p => p.strengths || []);
  const allAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || []);
  
  // Remove duplicates
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)];

  const handleCreateSession = async (sessionData: Omit<StudySession, 'id' | 'student_id'>) => {
    await createSession(sessionData);
  };

  return (
    <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'} space-y-6 md:space-y-8`}>
      <div>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2`}>My Dashboard</h1>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Track your progress and performance across all your courses
        </p>
      </div>

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
              <Alert key={index} className={`${bgColor} ${isMobile ? 'p-3' : ''}`}>
                <Icon className={`h-4 w-4 ${textColor}`} />
                <AlertDescription className={`${textColor} ${isMobile ? 'text-sm' : ''}`}>
                  {insight.message}
                  {insight.metric && ` (${insight.metric.toFixed(1)}${insight.type === 'improvement' ? '%' : ''})`}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceOverview performance={performance} />

          {(uniqueStrengths.length > 0 || uniqueAreasForImprovement.length > 0) && (
            <StrengthsAndAreas 
              strengths={uniqueStrengths} 
              areasForImprovement={uniqueAreasForImprovement} 
            />
          )}

          <div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-4`}>My Courses</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  performance={performance.find(p => p.course_id === course.course_id)}
                />
              ))}
              {courses.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>You are not enrolled in any courses yet.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <StudyCalendar 
              sessions={sessions}
              courses={courses}
              onCreateSession={handleCreateSession}
            />
          </div>
        </div>

        <div className={isMobile ? 'mt-6' : ''}>
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
