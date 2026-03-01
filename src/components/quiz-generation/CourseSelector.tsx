
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
      <Label htmlFor="course-select" className="text-sm font-medium text-stone-600">Course</Label>
      <Select
        value={selectedCourseId}
        onValueChange={setSelectedCourseId}
        disabled={isLoading}
      >
        <SelectTrigger id="course-select" className="w-full bg-stone-50 border-stone-200 focus:ring-stone-300 focus:border-stone-300">
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
      <p className="text-xs text-stone-400 leading-relaxed">
        Create a course first to track quiz performance and progress.
      </p>
    </div>
  );
}
