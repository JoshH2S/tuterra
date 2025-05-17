
import { motion, AnimatePresence } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { InterviewQuestion } from "@/types/interview";
import { useEffect, useRef, useState } from "react";

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
  const [safetyTimeoutTriggered, setSafetyTimeoutTriggered] = useState(false);
  const safetyTimerId = useRef<number | null>(null);
  
  // Reset the completion ref and safety state when question or typing effect changes
  useEffect(() => {
    typingCompleteRef.current = false;
    setSafetyTimeoutTriggered(false);
    
    // Clear any existing safety timeout
    if (safetyTimerId.current !== null) {
      clearTimeout(safetyTimerId.current);
      safetyTimerId.current = null;
    }
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
      // Clear any existing timeout first
      if (safetyTimerId.current !== null) {
        clearTimeout(safetyTimerId.current);
      }
      
      // Set a new safety timeout
      safetyTimerId.current = window.setTimeout(() => {
        if (!typingCompleteRef.current) {
          console.log("QuestionDisplay: Safety timeout triggered, forcing typing complete");
          setSafetyTimeoutTriggered(true);
          onTypingComplete();
          typingCompleteRef.current = true;
        }
      }, 3000); // 3 second safety timeout
      
      return () => {
        if (safetyTimerId.current !== null) {
          clearTimeout(safetyTimerId.current);
          safetyTimerId.current = null;
        }
      };
    }
  }, [typingEffect, onTypingComplete, currentQuestion?.id]);
  
  // Used for shimmer effect completion
  const handleShimmerComplete = () => {
    if (onTypingComplete && !typingCompleteRef.current) {
      console.log("QuestionDisplay: Shimmer animation completed, calling onTypingComplete");
      onTypingComplete();
      typingCompleteRef.current = true;
    }
  };
  
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
              key="question-shimmer"
              className="text-lg font-medium md:text-xl"
              duration={2}
              onAnimationComplete={handleShimmerComplete}
            >
              {currentQuestion.question}
            </TextShimmer>
          ) : (
            // Show static text after effect
            <motion.h2 
              key="question-static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl md:text-2xl font-semibold"
            >
              {currentQuestion.question}
            </motion.h2>
          )
        )}
        
        {/* Safety indicator - only shown in development */}
        {process.env.NODE_ENV === 'development' && safetyTimeoutTriggered && (
          <div className="absolute top-0 right-0 text-xs text-amber-500 bg-amber-50 px-1 rounded">
            Safety timeout triggered
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
