
import { motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { InterviewQuestion } from "@/types/interview";

interface QuestionDisplayProps {
  currentQuestion: InterviewQuestion | null;
  typingEffect: boolean;
}

export const QuestionDisplay = ({ 
  currentQuestion, 
  typingEffect 
}: QuestionDisplayProps) => {
  if (!currentQuestion) return null;
  
  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex items-center"
    >
      {currentQuestion.question && (
        typingEffect ? (
          // Show with shimmer during typing effect
          <TextShimmer 
            className="text-lg font-medium"
            duration={2}
          >
            {currentQuestion.question}
          </TextShimmer>
        ) : (
          // Show static text after effect
          <h2 className="text-xl font-semibold">
            {currentQuestion.question}
          </h2>
        )
      )}
    </motion.div>
  );
};
