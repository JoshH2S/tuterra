import { Book } from "lucide-react";
import { Course } from "@/types/course";
import CourseCard from "./CourseCard";

interface CourseListProps {
  courses: Course[];
  onFileSelect: (file: File, courseId: string) => Promise<void>;
}

export const CourseList = ({ courses, onFileSelect }: CourseListProps) => {
  if (courses.length === 0) {
    return (
      <div className="col-span-2 text-center py-8 text-gray-500">
        <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No courses created yet</p>
        <p className="text-sm">Create your first course to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
};