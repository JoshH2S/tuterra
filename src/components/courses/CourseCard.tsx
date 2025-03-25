
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/types/course";
import { Calendar, Users, BookOpen, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const { isMobile } = useResponsive();
  
  // These would be real in a production app, but we'll mock them for now
  const progressValue = 75;
  const studentCount = 24;
  
  return (
    <motion.div
      whileHover={!isMobile ? { y: -4 } : undefined}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Course Header */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {course.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Created {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Created {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {studentCount} Students
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/courses/${course.id}/grades`}>
              <BookOpen className="w-4 h-4 mr-2" />
              View Course
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
