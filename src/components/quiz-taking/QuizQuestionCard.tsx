
import { useState } from "react";
import { motion } from "framer-motion";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestion as QuizQuestionComponent } from "@/components/quiz/QuizQuestion";
import { QuizAnswerFeedback } from "./QuizAnswerFeedback";
import { Card } from "@/components/ui/card";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onJumpToQuestion?: (index: number) => void;
  showFeedback: boolean;
  explanations: Record<string, string>;
  isGeneratingExplanation: boolean;
  timeRemaining: number | null;
  answeredQuestions: number[];
}

export function QuizQuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onJumpToQuestion,
  showFeedback,
  explanations,
  isGeneratingExplanation,
  timeRemaining,
  answeredQuestions
}: QuizQuestionCardProps) {
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  if (!question) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showFeedback && selectedAnswer ? (
        <QuizAnswerFeedback 
          question={question}
          userAnswer={selectedAnswer}
          isCorrect={selectedAnswer === question.correct_answer}
          explanation={explanations[question.id]}
          isLoading={isGeneratingExplanation}
          expanded={expandedFeedback}
          onToggle={() => setExpandedFeedback(!expandedFeedback)}
        />
      ) : (
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
      )}
    </div>
  );
}
