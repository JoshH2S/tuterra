import { useState, useRef, useEffect } from "react";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizAnswerOption } from "./QuizAnswerOption";
import { QuizAnswerFeedback } from "./QuizAnswerFeedback";
import { QuizQuestion as QuizQuestionType } from "@/hooks/quiz/quizTypes";

interface QuizQuestionCardProps {
  question: QuizQuestionType;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswerSelect: (answer: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showFeedback: boolean;
  explanations?: Record<number, string>;
  isGeneratingExplanation?: boolean;
  timeRemaining?: number | null;
  answeredQuestions?: number[];
}

export const QuizQuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  showFeedback,
  explanations = {},
  isGeneratingExplanation = false,
  timeRemaining = null,
  answeredQuestions = [],
}: QuizQuestionCardProps) => {
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const minSwipeDistance = 50;

  // Reset RadioGroup value when question changes
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(question?.id || '');
  
  useEffect(() => {
    // Update the tracked question ID whenever the question changes
    if (question?.id && question.id !== currentQuestionId) {
      setCurrentQuestionId(question.id);
    }
  }, [question, currentQuestionId]);

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
        onNext && onNext();
      } else {
        onPrevious && onPrevious();
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Use the modern design for non-mobile devices, classic design for mobile
  if (isMobile) {
    // ... keep existing code for mobile view
    const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
    const isAnswerCorrect = selectedAnswer === question.correct_answer;
    const answerSubmitted = showFeedback && selectedAnswer;
    const currentExplanation = explanations[currentIndex];

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
      <Card 
        className="max-w-2xl mx-auto"
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardHeader>
          <CardTitle>Take Quiz</CardTitle>
          <CardDescription>
            Question {currentIndex + 1} / {totalQuestions}
          </CardDescription>
          <Progress value={progressPercentage} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Question {currentIndex + 1} / {totalQuestions}
            </p>
            <p className="text-gray-600">{question.question}</p>
          </div>
          
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={(value) => onAnswerSelect(value)}
            className="space-y-1 sm:space-y-2"
            disabled={Boolean(answerSubmitted)}
            key={question.id} // Force RadioGroup to remount when question changes
          >
            {Object.entries(question.options).map(([key, value]) => (
              <QuizAnswerOption
                key={`${question.id}-${key}`} // Ensure unique keys across questions
                optionKey={key}
                optionValue={value}
                isCorrect={key === question.correct_answer}
                isSelected={key === selectedAnswer}
                showFeedback={Boolean(answerSubmitted)}
                disabled={Boolean(answerSubmitted)}
              />
            ))}
          </RadioGroup>

          {answerSubmitted && (
            <QuizAnswerFeedback
              isCorrect={isAnswerCorrect}
              correctAnswerText={question.options[question.correct_answer]}
              explanation={currentExplanation}
              isLoadingExplanation={isGeneratingExplanation}
            />
          )}

          <div className="mt-4 flex justify-center text-sm text-gray-500">
            <p>Swipe left/right to navigate</p>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // Modern design for desktop
    return (
      <QuizQuestion
        question={question}
        currentQuestion={currentIndex}
        totalQuestions={totalQuestions}
        timeRemaining={timeRemaining}
        selectedAnswer={selectedAnswer}
        answeredQuestions={answeredQuestions}
        onAnswerSelect={onAnswerSelect}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    );
  }
};
