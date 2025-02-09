
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    options: Record<string, string>;
  };
  index: number;
  selectedAnswer: string;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export const QuizQuestion = ({ 
  question, 
  index, 
  selectedAnswer, 
  onAnswerChange 
}: QuizQuestionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <span className="font-medium">{index + 1}.</span>
        <div className="flex-1">
          <p className="font-medium">{question.question}</p>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => onAnswerChange(question.id, value)}
            className="mt-2"
          >
            {Object.entries(question.options).map(([option, text]) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>
                  {text as string}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
