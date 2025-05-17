
import { motion, AnimatePresence } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { InterviewQuestion } from "@/types/interview";
import { useEffect, useRef } from "react";

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
  const typingCompleteRef = useRef(false);
  
  // Reset the completion ref when question or typing effect changes
  useEffect(() => {
    typingCompleteRef.current = false;
  }, [currentQuestion?.id, typingEffect]);
  
  // Ensure typing complete is called when no longer in typing effect mode
  useEffect(() => {
    if (!typingEffect && onTypingComplete && !typingCompleteRef.current) {
      console.log("QuestionDisplay: Typing effect ended, calling onTypingComplete");
      onTypingComplete();
      typingCompleteRef.current = true;
    }
  }, [typingEffect, onTypingComplete, currentQuestion]);
  
  // Safety timeout to ensure typing complete is called even if animations fail
  useEffect(() => {
    if (typingEffect && onTypingComplete) {
      const safetyTimer = setTimeout(() => {
        if (typingEffect && !typingCompleteRef.current) {
          console.log("QuestionDisplay: Safety timeout triggered, forcing typing complete");
          onTypingComplete();
          typingCompleteRef.current = true;
        }
      }, 5000); // 5 second safety timeout
      
      return () => clearTimeout(safetyTimer);
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
      className="h-full flex items-center px-1 py-2"
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
