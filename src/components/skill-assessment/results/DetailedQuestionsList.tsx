
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface QuestionResult {
  question: string;
  correct: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  skill?: string;
}

interface DetailedQuestionsListProps {
  questions: QuestionResult[];
}

export const DetailedQuestionsList = ({ questions }: DetailedQuestionsListProps) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No question details available
      </div>
    );
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {questions.map((questionItem, index) => (
        <motion.div 
          key={index} 
          className="border-b pb-4 last:border-b-0 last:pb-0"
          variants={item}
          whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.01)" }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-start gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              {questionItem.correct ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
            </motion.div>
            <div>
              <p className="font-medium">{questionItem.question}</p>
              <div className="mt-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className={questionItem.correct ? "text-green-600" : "text-red-600"}>
                    {Array.isArray(questionItem.userAnswer) 
                      ? questionItem.userAnswer.join(", ") 
                      : questionItem.userAnswer || "No answer"}
                  </span>
                </p>
                {!questionItem.correct && (
                  <motion.p 
                    className="mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-muted-foreground">Correct answer: </span>
                    <span className="text-green-600">
                      {Array.isArray(questionItem.correctAnswer) 
                        ? questionItem.correctAnswer.join(", ") 
                        : questionItem.correctAnswer}
                    </span>
                  </motion.p>
                )}
              </div>
              {questionItem.skill && (
                <motion.span 
                  className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                >
                  {questionItem.skill}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
