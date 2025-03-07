
import { motion } from "framer-motion";
import { CourseCard } from "./CourseCard";
import { Course } from "@/types/course";

interface CoursesGridProps {
  courses: Course[];
}

export const CoursesGrid = ({ courses }: CoursesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <CourseCard course={course} />
        </motion.div>
      ))}
    </div>
  );
};
