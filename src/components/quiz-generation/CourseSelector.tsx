
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormLabel } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";

interface CourseSelectorProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
}

export function CourseSelector({ selectedCourseId, setSelectedCourseId }: CourseSelectorProps) {
  const { courses, loading } = useCourses();

  return (
    <div className="space-y-2">
      <FormLabel htmlFor="course-select">Course</FormLabel>
      <Select
        value={selectedCourseId}
        onValueChange={setSelectedCourseId}
        disabled={loading}
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
        Choose the course this quiz will be associated with
      </p>
    </div>
  );
}
