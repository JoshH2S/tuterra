
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="w-full max-w-xs">
      <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${progressPercentage}%` 
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="h-full bg-gradient-to-r from-primary to-primary/80"
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className="truncate">Question {current} of {total}</span>
        <span className="ml-2">{Math.round(progressPercentage)}%</span>
      </div>
    </div>
  );
}
