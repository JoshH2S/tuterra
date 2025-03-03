
import { CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

interface QuizAnswerOptionProps {
  optionKey: string;
  optionValue: string;
  isCorrect: boolean;
  isSelected: boolean;
  showFeedback: boolean;
  disabled: boolean;
}

export const QuizAnswerOption = ({
  optionKey,
  optionValue,
  isCorrect,
  isSelected,
  showFeedback,
  disabled,
}: QuizAnswerOptionProps) => {
  let optionClassName = "flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded-md transition-colors";
  
  if (showFeedback) {
    if (isCorrect) {
      optionClassName += " bg-green-50 border-green-200 border";
    } else if (isSelected && !isCorrect) {
      optionClassName += " bg-red-50 border-red-200 border";
    }
  }

  return (
    <div className={optionClassName}>
      <RadioGroupItem 
        value={optionKey} 
        id={`option-${optionKey}`} 
        className="border-2"
        disabled={disabled}
      />
      <Label 
        htmlFor={`option-${optionKey}`} 
        className="flex-1 cursor-pointer py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
      >
        {optionValue}
      </Label>
      {showFeedback && isCorrect && (
        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
      )}
      {showFeedback && isSelected && !isCorrect && (
        <XCircle className="h-5 w-5 text-red-500 ml-2" />
      )}
    </div>
  );
};
