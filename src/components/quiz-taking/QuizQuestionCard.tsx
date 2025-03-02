
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

interface QuizQuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answer: string) => void;
}

export const QuizQuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}: QuizQuestionCardProps) => {
  // Safety check in case question is undefined
  if (!question) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Take Quiz</CardTitle>
          <CardDescription>
            Question {currentIndex + 1} / {totalQuestions}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-amber-600">
            Error loading question. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Take Quiz</CardTitle>
        <CardDescription>
          Question {currentIndex + 1} / {totalQuestions}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Question {currentIndex + 1} / {totalQuestions}
          </p>
          <p className="text-gray-600">{question.question}</p>
        </div>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={(value) => onAnswerSelect(value)}
          className="space-y-1 sm:space-y-2"
        >
          {Object.entries(question.options).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <RadioGroupItem value={key} id={`option-${key}`} className="border-2" />
              <Label 
                htmlFor={`option-${key}`} 
                className="flex-1 cursor-pointer py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
              >
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
