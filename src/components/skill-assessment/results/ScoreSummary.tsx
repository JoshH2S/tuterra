
import { Award } from "lucide-react";
import { motion } from "framer-motion";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";

interface ScoreSummaryProps {
  score: number;
  timeSpent?: number;
  detailedResultsLength: number;
  level?: string;
  skillScores?: Record<string, { correct: number; total: number; score: number }>;
}

export const ScoreSummary = ({
  score,
  timeSpent,
  detailedResultsLength,
  level,
  skillScores
}: ScoreSummaryProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Format time display
  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Prepare sections for progress tracker
  const getSections = () => {
    if (!skillScores) return [];
    
    return Object.entries(skillScores).map(([skill, data]) => ({
      id: skill,
      label: skill,
      weight: data.total / (detailedResultsLength || 1),
      score: data.score
    }));
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    })
  };

  const scoreCircleAnimation = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: "spring",
          damping: 8,
          stiffness: 100,
          restDelta: 0.001
        }
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
    >
      <motion.div 
        className="relative"
        variants={scoreCircleAnimation}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Award className="h-24 w-24 text-primary opacity-20" />
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: 0.4, duration: 0.3 }
          }}
        >
          <motion.span 
            className={`text-4xl font-bold ${getScoreColor(score)}`}
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              transition: { 
                delay: 0.4,
                type: "spring",
                stiffness: 300
              }
            }}
          >
            {score}%
          </motion.span>
        </motion.div>
      </motion.div>
      
      <motion.p 
        className="mt-4 text-center text-muted-foreground"
        variants={fadeInUp}
        custom={1}
      >
        {score >= 80 ? (
          "Excellent! You've demonstrated strong skills in this assessment."
        ) : score >= 60 ? (
          "Good job! You've shown competency with room for improvement."
        ) : (
          "This area needs more practice. Consider reviewing the topics."
        )}
      </motion.p>

      <motion.div 
        className="mt-6 space-y-4 w-full"
        variants={fadeInUp}
        custom={2}
      >
        <AssessmentProgressTracker 
          sections={getSections()}
          showScores={true}
        />
        
        <motion.div 
          className="pt-4 border-t flex justify-between text-sm"
          variants={fadeInUp}
          custom={3}
        >
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <p className="text-muted-foreground">Time spent</p>
            <p className="font-medium">{formatTime(timeSpent)}</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <p className="text-muted-foreground">Questions</p>
            <p className="font-medium">{detailedResultsLength}</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <p className="text-muted-foreground">Level</p>
            <p className="font-medium capitalize">{level || "Intermediate"}</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
