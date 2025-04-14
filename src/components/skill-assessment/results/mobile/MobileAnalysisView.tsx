
import { motion } from "framer-motion";
import { AdvancedAnalysisSection } from "@/components/skill-assessment/PremiumFeatures";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface MobileAnalysisViewProps {
  result: {
    skill_scores?: Record<string, { correct: number; total: number; score: number }>;
  };
  userTier: string;
  recommendations: string[];
  skillBenchmarks: Record<string, number>;
  slideVariants: any;
  getDirection: (view: string) => number;
}

export const MobileAnalysisView = ({
  result,
  userTier,
  recommendations,
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
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analysis</CardTitle>
          <CardDescription>Skills and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto pb-24">
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
            skillBenchmarks={skillBenchmarks}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
