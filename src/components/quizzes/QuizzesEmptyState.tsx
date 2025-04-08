
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizzesEmptyStateProps {
  onCreateQuiz: () => void;
}

export function QuizzesEmptyState({ onCreateQuiz }: QuizzesEmptyStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 mb-4">
        <ClipboardList className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-lg font-semibold gradient-text mb-2">
        No Quizzes Available
      </h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
        Create your first quiz to start assessing student knowledge.
      </p>
      
      <Button onClick={onCreateQuiz} className="touch-manipulation">
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Quiz
      </Button>
    </motion.div>
  );
}
