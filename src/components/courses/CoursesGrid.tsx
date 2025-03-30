
import { CourseCard } from "./CourseCard";
import { Course } from "@/types/course";

interface CoursesGridProps {
  courses: Course[];
  onCourseDeleted?: () => void;
  onCourseUpdated?: () => void;
}

export const CoursesGrid = ({ courses, onCourseDeleted, onCourseUpdated }: CoursesGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onCourseDeleted={onCourseDeleted}
          onCourseUpdated={onCourseUpdated}
        />
      ))}
    </div>
  );
};
