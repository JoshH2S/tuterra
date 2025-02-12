
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-4 ${isMobile ? 'pb-4' : ''}`}>
      <div className="flex items-start gap-2">
        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{index + 1}.</span>
        <div className="flex-1">
          <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{question.question}</p>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={(value) => onAnswerChange(question.id, value)}
            className={`mt-3 space-y-${isMobile ? '3' : '2'}`}
          >
            {Object.entries(question.options).map(([option, text]) => (
              <div 
                key={option} 
                className={`
                  flex items-center space-x-2 
                  ${isMobile ? 'p-2 hover:bg-gray-50 rounded-lg' : ''}
                `}
              >
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}-${option}`}
                  className={isMobile ? 'h-5 w-5' : ''}
                />
                <Label 
                  htmlFor={`${question.id}-${option}`}
                  className={`flex-1 ${isMobile ? 'text-sm py-1' : ''}`}
                >
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
