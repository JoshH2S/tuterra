
import { motion } from "framer-motion";
import { AdvancedAnalysisSection } from "@/components/skill-assessment/PremiumFeatures";

interface MobileAnalysisViewProps {
  result: {
    skill_scores?: Record<string, { correct: number; total: number; score: number }>;
  };
  userTier: string;
  recommendations: string[];
  benchmarks: {
    industry: string;
    role: string;
    averageScore: number;
  }[];
  skillBenchmarks: Record<string, number>;
  slideVariants: any;
  getDirection: (view: string) => number;
}

export const MobileAnalysisView = ({
  result,
  userTier,
  recommendations,
  benchmarks,
  skillBenchmarks,
  slideVariants,
  getDirection
}: MobileAnalysisViewProps) => {
  return (
    <motion.div
      key="analysis"
      custom={getDirection('analysis')}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute w-full"
    >
      <div className="pb-16">
        <AdvancedAnalysisSection 
          userTier={userTier}
          skills={
            result.skill_scores 
              ? Object.entries(result.skill_scores).map(([name, data]) => ({
                  name,
                  score: data.score
                }))
              : []
          }
          recommendations={recommendations}
          benchmarks={benchmarks}
          skillBenchmarks={skillBenchmarks}
        />
      </div>
    </motion.div>
  );
};
