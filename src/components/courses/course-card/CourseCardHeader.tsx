
import { Course } from "@/types/course";

interface CourseCardHeaderProps {
  course: Course;
}

export const CourseCardHeader: React.FC<CourseCardHeaderProps> = ({ course }) => {
  return (
    <div className="relative h-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200" />
      <div className="absolute bottom-4 left-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {course.title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          {course.description || "No description provided"}
        </p>
      </div>
    </div>
  );
};
