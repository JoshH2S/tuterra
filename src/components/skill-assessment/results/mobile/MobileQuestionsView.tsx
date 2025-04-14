
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DetailedQuestionsList } from "../DetailedQuestionsList";

interface MobileQuestionsViewProps {
  result: {
    detailed_results: Array<{
      question: string;
      correct: boolean;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      skill?: string;
    }>;
  };
  slideVariants: any;
  getDirection: (view: string) => number;
}

export const MobileQuestionsView = ({
  result,
  slideVariants,
  getDirection
}: MobileQuestionsViewProps) => {
  return (
    <motion.div
      key="questions"
      custom={getDirection('questions')}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Question breakdown</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto pb-24">
          <DetailedQuestionsList questions={result.detailed_results || []} />
        </CardContent>
      </Card>
    </motion.div>
  );
};
