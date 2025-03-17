
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { StudentCourse } from "@/types/student";

interface CourseSelectorProps {
  courses: any[];
  selectedCourseId: string | undefined;
  onCourseSelect: (courseId: string) => void;
  isLoading: boolean;
}

export function CourseSelector({ 
  courses, 
  selectedCourseId, 
  onCourseSelect, 
  isLoading 
}: CourseSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="course">Course</Label>
      <Select 
        value={selectedCourseId} 
        onValueChange={onCourseSelect}
        disabled={isLoading}
      >
        <SelectTrigger id="course">
          <SelectValue placeholder="Select course" />
        </SelectTrigger>
        <SelectContent>
          {courses && courses.length > 0 ? (
            courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-courses" disabled>
              No courses available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
