
import { ReactNode } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

interface Question {
  question: string;
  type: string;
  options: Record<string, string>;
  correctAnswer: string | string[];
  skill?: string;
}

interface QuestionDisplayProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  currentAnswer: string | string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
  progress: number;
}

export const QuestionDisplay = ({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswerChange,
  progress
}: QuestionDisplayProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="shadow-md transition-all border-gray-200 dark:border-gray-700">
      <CardHeader className={isMobile ? "px-4 py-4" : ""}>
        <div className="mb-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
        
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="hidden md:inline">Question {questionIndex + 1}</span>
          <span className="md:hidden">Q{questionIndex + 1}</span>
          {question.skill && (
            <motion.span 
              className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {question.skill}
            </motion.span>
          )}
        </CardTitle>
        <CardDescription>
          {question.type === 'multiple_answer' ? (
            Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0 ?
              `Select ${question.correctAnswer.length} answers` :
              'Select all that apply'
          ) : (
            'Select the best answer'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? "px-4 pb-4" : ""}`}>
        <motion.div 
          className="text-lg font-medium mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {question.question}
        </motion.div>

        {renderQuestionOptions(question, currentAnswer, onAnswerChange)}
      </CardContent>
    </Card>
  );
};

function renderQuestionOptions(
  question: Question, 
  currentAnswer: string | string[] | undefined, 
  onAnswerChange: (value: string | string[]) => void
): ReactNode {
  const optionsWithDelay = (component: ReactNode, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
    >
      {component}
    </motion.div>
  );

  if (question.type === 'multiple_choice') {
    return (
      <RadioGroup
        value={currentAnswer as string || ""}
        onValueChange={(value) => onAnswerChange(value)}
        className="space-y-3"
      >
        {Object.entries(question.options).map(([key, value], index) => (
          optionsWithDelay(
            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 active:bg-muted/70 transition-colors touch-manipulation">
              <RadioGroupItem value={key} id={`option-${key}`} />
              <label 
                htmlFor={`option-${key}`}
                className="flex-1 cursor-pointer py-1 touch-manipulation"
              >
                {value}
              </label>
            </div>,
            index
          )
        ))}
      </RadioGroup>
    );
  } else if (question.type === 'multiple_answer') {
    const currentAnswers = (currentAnswer as string[]) || [];
    
    return (
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value], index) => {
          const isChecked = currentAnswers.includes(key);
          
          return optionsWithDelay(
            <div className="flex items-start space-x-2 border p-3 rounded-md hover:bg-muted/50 active:bg-muted/70 transition-colors touch-manipulation">
              <Checkbox 
                id={`option-${key}`}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onAnswerChange([...currentAnswers, key]);
                  } else {
                    onAnswerChange(currentAnswers.filter(item => item !== key));
                  }
                }}
                className="mt-1" // Better vertical alignment
              />
              <label
                htmlFor={`option-${key}`}
                className="flex-1 cursor-pointer py-1 touch-manipulation"
              >
                {value}
              </label>
            </div>,
            index
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <p>Question type not supported</p>
    </div>
  );
}
