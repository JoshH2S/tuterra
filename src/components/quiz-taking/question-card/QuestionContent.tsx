
import React from "react";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestion as QuizQuestionComponent } from "@/components/quiz/QuizQuestion";

interface QuestionContentProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onJumpToQuestion?: (index: number) => void;
  timeRemaining: number | null;
  answeredQuestions: number[];
}

export function QuestionContent({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onJumpToQuestion,
  timeRemaining,
  answeredQuestions
}: QuestionContentProps) {
  return (
    <QuizQuestionComponent
      question={question}
      currentQuestion={currentIndex}
      totalQuestions={totalQuestions}
      selectedAnswer={selectedAnswer}
      answeredQuestions={answeredQuestions}
      timeRemaining={timeRemaining}
      onAnswerSelect={onAnswerSelect}
      onNext={onNext}
      onPrevious={onPrevious}
      onJumpToQuestion={onJumpToQuestion}
    />
  );
}
