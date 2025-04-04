
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CourseOption {
  id: string;
  title: string;
  code?: string;
}

interface CourseSelectorProps {
  courses: CourseOption[];
  courseId: string;
  onCourseSelect: (courseId: string) => void;
  isLoading: boolean;
}

export function CourseSelector({ 
  courses, 
  courseId, 
  onCourseSelect, 
  isLoading 
}: CourseSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="course">Course</Label>
      <Select 
        value={courseId} 
        onValueChange={onCourseSelect}
        disabled={isLoading}
      >
        <SelectTrigger id="course" className="w-full">
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
