
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionDot } from "@/components/quiz/QuestionDot";

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
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Hide the swipe hint after 3 seconds
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => setShowSwipeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Enhanced touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
    setSwipeInProgress(true);
    setShowSwipeHint(false);
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

  // Visual feedback based on swipe
  const swipeAnimation = {
    x: swipeInProgress ? -swipeDistance * 0.2 : 0,
    opacity: swipeInProgress ? (Math.abs(swipeDistance) > 100 ? 0.7 : 1) : 1,
    transition: { duration: swipeInProgress ? 0 : 0.3 }
  };

  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div 
      className="w-full touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question text */}
      <motion.div
        animate={swipeAnimation}
        className="w-full mb-6"
      >
        <h3 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {question.question}
        </h3>
      </motion.div>

      {/* Answer options */}
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value], index) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onAnswerSelect(key)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all",
              selectedAnswer === key 
                ? "border-primary bg-primary/5" 
                : "hover:border-gray-300 dark:hover:border-gray-600 border-gray-200 dark:border-gray-700",
              "touch-manipulation"
            )}
          >
            <div className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0",
                selectedAnswer === key 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              )}>
                {OPTION_LETTERS[index]}
              </div>
              <span className="text-base">{value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="mt-10 flex flex-col space-y-6">
        <div className="flex justify-center space-x-1.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <QuestionDot
              key={idx}
              isActive={currentIndex === idx}
              isAnswered={answeredQuestions.includes(idx)}
              onClick={onJumpToQuestion ? () => onJumpToQuestion(idx) : undefined}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Previous</span>
          </Button>
          
          <Button
            onClick={onNext}
            className="px-4 py-2"
            disabled={!selectedAnswer}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Swipe indicator */}
      {showSwipeHint && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-20"
        >
          Swipe left/right to navigate
        </motion.div>
      )}
    </div>
  );
}
