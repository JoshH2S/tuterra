
import { Question } from "@/types/quiz";
import { QuizQuestionItem } from "./QuizQuestionItem";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

interface QuizProps {
  questions: Question[];
  startIndex?: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const Quiz = ({ 
  questions, 
  startIndex = 0,
  onSwipe
}: QuizProps) => {
  // Ensure questions is always a valid array
  const validQuestions = Array.isArray(questions) ? questions : [];

  // Only set up swipe handlers if onSwipe callback is provided
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipe && onSwipe('left'),
    onSwipedRight: () => onSwipe && onSwipe('right'),
    trackMouse: false,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  });
  
  const swipeProps = onSwipe ? swipeHandlers : {};

  if (validQuestions.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No questions available to display
      </div>
    );
  }
  
  return (
    <div className="w-full touch-manipulation" {...swipeProps}>
      <div className="space-y-6 mt-4">
        {validQuestions.map((question, index) => (
          <motion.div
            key={`question-${startIndex + index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuizQuestionItem 
              question={question}
              index={startIndex + index}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
