
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScoreSummary } from "../ScoreSummary";

interface MobileSummaryViewProps {
  result: {
    score: number;
    time_spent?: number;
    detailed_results: Array<any>;
    level?: string;
    skill_scores?: Record<string, { correct: number; total: number; score: number }>;
  };
  slideVariants: any;
  getDirection: (view: string) => number;
}

export const MobileSummaryView = ({ 
  result, 
  slideVariants, 
  getDirection 
}: MobileSummaryViewProps) => {
  return (
    <motion.div
      key="summary"
      custom={getDirection('summary')}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute w-full"
    >
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Your assessment performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreSummary 
            score={result.score}
            timeSpent={result.time_spent}
            detailedResultsLength={result.detailed_results.length}
            level={result.level}
            skillScores={result.skill_scores}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
