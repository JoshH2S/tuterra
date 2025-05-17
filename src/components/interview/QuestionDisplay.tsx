
import { motion, AnimatePresence } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { InterviewQuestion } from "@/types/interview";
import { useEffect } from "react";

interface QuestionDisplayProps {
  currentQuestion: InterviewQuestion | null;
  typingEffect: boolean;
  onTypingComplete?: () => void;
}

export const QuestionDisplay = ({ 
  currentQuestion, 
  typingEffect,
  onTypingComplete
}: QuestionDisplayProps) => {
  useEffect(() => {
    // If there's no typing effect and we have an onTypingComplete callback
    if (!typingEffect && onTypingComplete) {
      console.log("QuestionDisplay: Typing effect ended, calling onTypingComplete");
      onTypingComplete();
    }
  }, [typingEffect, onTypingComplete]);
  
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
      <AnimatePresence mode="wait">
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
            <motion.h2 
              key="question-static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold"
            >
              {currentQuestion.question}
            </motion.h2>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};
