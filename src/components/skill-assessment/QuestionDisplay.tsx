
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
  return (
    <Card className="transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="hidden md:inline">Question {questionIndex + 1} of {totalQuestions}</span>
          <span className="md:hidden">Question {questionIndex + 1}</span>
          {question.skill && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
              {question.skill}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Select the best answer for this question
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium mb-4">
          {question.question}
        </div>

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
  if (question.type === 'multiple_choice') {
    return (
      <RadioGroup
        value={currentAnswer as string || ""}
        onValueChange={(value) => onAnswerChange(value)}
        className="space-y-3"
      >
        {Object.entries(question.options).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors touch-manipulation">
            <RadioGroupItem value={key} id={`option-${key}`} />
            <label 
              htmlFor={`option-${key}`}
              className="flex-1 cursor-pointer py-1 touch-manipulation"
            >
              {value}
            </label>
          </div>
        ))}
      </RadioGroup>
    );
  } else if (question.type === 'multiple_answer') {
    const currentAnswers = (currentAnswer as string[]) || [];
    
    return (
      <div className="space-y-3">
        {Object.entries(question.options).map(([key, value]) => {
          const isChecked = currentAnswers.includes(key);
          
          return (
            <div key={key} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors touch-manipulation">
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
              />
              <label
                htmlFor={`option-${key}`}
                className="flex-1 cursor-pointer py-1 touch-manipulation"
              >
                {value}
              </label>
            </div>
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
