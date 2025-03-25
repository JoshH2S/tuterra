
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";

interface CourseSelectorProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
}

export function CourseSelector({ selectedCourseId, setSelectedCourseId }: CourseSelectorProps) {
  const { courses, isLoading } = useCourses();

  return (
    <div className="space-y-2">
      <Label htmlFor="course-select">Course</Label>
      <Select
        value={selectedCourseId}
        onValueChange={setSelectedCourseId}
        disabled={isLoading}
      >
        <SelectTrigger id="course-select" className="w-full">
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Please create a course first to track quiz performance. Quizzes must be associated with a course for proper progress tracking.
      </p>
    </div>
  );
}
