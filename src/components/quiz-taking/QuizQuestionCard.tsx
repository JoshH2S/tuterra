
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionDifficulty } from "@/types/quiz";

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
        >
          {Object.entries(question.options).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded-md"
            >
              <RadioGroupItem value={key} id={key} className="border-2" />
              <Label htmlFor={key} className="flex-1 cursor-pointer">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
