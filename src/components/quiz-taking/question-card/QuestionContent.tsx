
import { useState } from "react";
import { motion } from "framer-motion";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { Card } from "@/components/ui/card";

interface QuestionContentProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  answeredQuestions: number[];
  timeRemaining: number | null;
  onAnswerSelect: (answer: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onJumpToQuestion?: (index: number) => void;
}

export function QuestionContent({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  answeredQuestions,
  onAnswerSelect,
  onNext,
  onPrevious,
  onJumpToQuestion
}: QuestionContentProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Handle touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      // Left swipe (next question)
      if (diff > 0 && onNext) {
        onNext();
      }
      // Right swipe (previous question)
      else if (diff < 0 && onPrevious) {
        onPrevious();
      }
    }
    
    setTouchStartX(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full"
    >
      <Card className="p-6 shadow-md">
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => (
              <div
                key={key}
                onClick={() => onAnswerSelect(key)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${selectedAnswer === key 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-card hover:bg-accent/10 border-border'}
                  flex items-center
                  touch-manipulation
                `}
              >
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center border
                  ${selectedAnswer === key ? 'border-primary bg-primary text-white' : 'border-muted-foreground'}
                `}>
                  {key}
                </div>
                <span className="text-base">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
