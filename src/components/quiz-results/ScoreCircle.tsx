
import React from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface ScoreCircleProps {
  percentageScore: number;
}

export function ScoreCircle({ percentageScore }: ScoreCircleProps) {
  const isMobile = useIsMobile();
  
  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Nice effort!";
    return "Keep practicing";
  };

  // Animation variants for mobile
  const circleAnimations = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    whileTap: isMobile ? { scale: 0.98 } : {}
  };

  return (
    <motion.div 
      className="relative flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent rounded-2xl p-4 sm:p-8"
      initial="initial"
      animate="animate"
      whileTap="whileTap"
      variants={circleAnimations}
    >
      <div className="relative">
        <CircularProgress 
          percentage={percentageScore} 
          size={isMobile ? 180 : 240}
          strokeWidth={isMobile ? 10 : 12}
          className="text-primary"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            {percentageScore}%
          </span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getPerformanceMessage(percentageScore)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
