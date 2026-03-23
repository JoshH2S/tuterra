import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
    >
      <p className={`text-xl font-normal leading-relaxed text-gray-900 transition-opacity duration-300 ${typingEffect ? "opacity-60" : "opacity-100"}`}>
        {currentQuestion.question}
      </p>
    </motion.div>
  );
};
