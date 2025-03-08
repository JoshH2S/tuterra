
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
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipe && onSwipe('left'),
    onSwipedRight: () => onSwipe && onSwipe('right'),
    trackMouse: false,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  });

  if (!questions || questions.length === 0) return null;
  
  const swipeProps = onSwipe ? swipeHandlers : {};
  
  return (
    <div className="w-full touch-manipulation" {...swipeProps}>
      <div className="space-y-6 mt-4">
        {questions.map((question, index) => (
          <motion.div
            key={startIndex + index}
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
