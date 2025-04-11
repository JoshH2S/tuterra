
import { useState, useEffect } from "react";
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
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState<number>(0);
  const [swipeInProgress, setSwipeInProgress] = useState(false);

  // Enhanced touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
    setSwipeInProgress(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX) return;
    
    const currentX = e.touches[0].clientX;
    setTouchEndX(currentX);
    
    // Calculate real-time swipe distance for visual feedback
    const distance = touchStartX - currentX;
    setSwipeDistance(distance);
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
    
    // Reset swipe states
    setTouchStartX(null);
    setTouchEndX(null);
    setSwipeDistance(0);
    setSwipeInProgress(false);
  };

  // Visual feedback based on swipe
  const swipeAnimation = {
    x: swipeInProgress ? -swipeDistance * 0.2 : 0,
    opacity: swipeInProgress ? (Math.abs(swipeDistance) > 100 ? 0.7 : 1) : 1,
    transition: { duration: swipeInProgress ? 0 : 0.3 }
  };

  // Add haptic feedback if supported
  useEffect(() => {
    if (swipeInProgress && Math.abs(swipeDistance) > 50 && 'vibrate' in navigator) {
      // Subtle vibration for swipe feedback
      try {
        navigator.vibrate(5);
      } catch (e) {
        // Vibration API not supported or disabled
      }
    }
  }, [swipeDistance, swipeInProgress]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full touch-manipulation"
    >
      <motion.div
        animate={swipeAnimation}
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
      
      {/* Swipe indicator */}
      {swipeInProgress && Math.abs(swipeDistance) > 20 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center text-sm text-muted-foreground animate-pulse">
          {swipeDistance > 0 ? 'Swipe left for next question' : 'Swipe right for previous question'}
        </div>
      )}
    </motion.div>
  );
}
