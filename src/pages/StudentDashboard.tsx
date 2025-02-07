
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();

  if (isLoading) {
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

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and performance across all your courses
        </p>
      </div>

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
