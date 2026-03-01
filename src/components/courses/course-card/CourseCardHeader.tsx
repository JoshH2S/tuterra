
import { Course } from "@/types/course";

interface CourseCardHeaderProps {
  course: Course;
}

export const CourseCardHeader: React.FC<CourseCardHeaderProps> = ({ course }) => {
  return (
    <div className="relative h-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
      <div className="absolute bottom-5 left-5">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {course.description || "No description provided"}
        </p>
      </div>
    </div>
  );
};
