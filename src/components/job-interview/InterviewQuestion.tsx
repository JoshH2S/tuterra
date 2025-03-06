
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/types/interview";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Flag, HelpCircle } from "lucide-react";
import { useCallback, useMemo } from "react";
import { QuestionBadge } from "./QuestionBadge";
import { QuestionProgress } from "./QuestionProgress";
import { KeywordHighlighter } from "./KeywordHighlighter";

interface InterviewQuestionProps {
  message: string;
  transcriptLength: number;
  question?: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const InterviewQuestion = ({ 
  message, 
  transcriptLength, 
  question,
  currentQuestionIndex,
  totalQuestions
}: InterviewQuestionProps) => {
  const isFinalQuestion = useMemo(() => 
    currentQuestionIndex === totalQuestions - 1,
    [currentQuestionIndex, totalQuestions]
  );
  
  // Animation variants for the question card
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.3 }
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
  
  // Accessibility-focused key handler for keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Implementation for keyboard navigation
    // This would interact with any interactive elements in the card
  }, []);

  // Check if we have a valid message
  if (!message || message.trim() === '') {
    console.error("Empty question message detected");
    return (
      <motion.div
        key="error-message"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-xl mx-auto"
      >
        <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
          <p className="text-destructive">Error: Question text is missing. Please retry the interview.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`message-${transcriptLength}-${message}`}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-xl mx-auto"
        role="region"
        aria-label="Interview question"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="bg-card rounded-lg border shadow-sm p-5 space-y-4">
          {/* Progress tracking */}
          <QuestionProgress 
            currentIndex={currentQuestionIndex} 
            totalQuestions={totalQuestions}
            estimatedTimeSeconds={question?.estimatedTimeSeconds}
            isFinalQuestion={isFinalQuestion}
          />
          
          {/* Question badges */}
          {(question?.category || question?.difficulty) && (
            <div className="flex gap-2 flex-wrap">
              {question?.category && (
                <QuestionBadge type="category" value={question.category} />
              )}
              {question?.difficulty && (
                <QuestionBadge type="difficulty" value={question.difficulty} />
              )}
            </div>
          )}
          
          {/* Final question indicator */}
          {isFinalQuestion && (
            <div className="flex items-center gap-2 text-primary text-sm border border-primary/20 bg-primary/5 rounded-md p-2">
              <Flag className="h-4 w-4" />
              <span>This is the final question</span>
            </div>
          )}
          
          {/* Question text with shimmer effect */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <TextShimmer
                duration={2}
                className="text-lg md:text-xl font-medium [--base-color:theme(colors.primary.400)] [--base-gradient-color:theme(colors.primary.300)] dark:[--base-color:theme(colors.primary.500)] dark:[--base-gradient-color:theme(colors.primary.300)]"
              >
                {message}
              </TextShimmer>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
          
          {/* Keywords highlight section */}
          {question?.keywords && question.keywords.length > 0 && (
            <div className="mt-3 text-muted-foreground">
              <KeywordHighlighter 
                text={message} 
                keywords={question.keywords}
              />
            </div>
          )}
          
          {/* Help tip */}
          <div className="mt-4 text-xs text-muted-foreground flex items-start gap-1">
            <HelpCircle className="h-3 w-3 mt-0.5" />
            <span>
              Take your time to think through your response. Quality answers are more important than speed.
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
