
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef, useEffect } from "react";

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
  onNext?: () => void;
  onPrevious?: () => void;
}

export const QuizQuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
}: QuizQuestionCardProps) => {
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Minimum swipe distance to register as a swipe (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0) {
        // Swiped left, go to next question
        onNext && onNext();
      } else {
        // Swiped right, go to previous question
        onPrevious && onPrevious();
      }
    }
    
    // Reset touch coordinates
    setTouchStart(null);
    setTouchEnd(null);
  };

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

  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <Card 
      className="max-w-2xl mx-auto"
      ref={cardRef}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <CardHeader>
        <CardTitle>Take Quiz</CardTitle>
        <CardDescription>
          Question {currentIndex + 1} / {totalQuestions}
        </CardDescription>
        <Progress 
          value={progressPercentage} 
          className="h-2 mt-2"
          indicatorClassName={`${progressPercentage <= 33 ? 'bg-orange-500' : progressPercentage <= 66 ? 'bg-yellow-500' : 'bg-green-500'}`}
        />
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
        {isMobile && (
          <div className="mt-4 flex justify-center text-sm text-gray-500">
            <p>Swipe left/right to navigate</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
