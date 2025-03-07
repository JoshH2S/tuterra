
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface CoursesEmptyStateProps {
  onCreateClick: () => void;
}

export const CoursesEmptyState = ({ onCreateClick }: CoursesEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Courses Yet
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
        Get started by creating your first course. You can add content, quizzes, and manage students.
      </p>
      
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Course
      </Button>
    </motion.div>
  );
};
