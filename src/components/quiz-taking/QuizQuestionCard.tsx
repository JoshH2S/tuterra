
import { useState } from "react";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuestionLoading } from "./question-card/QuestionLoading";
import { QuestionFeedback } from "./question-card/QuestionFeedback";
import { QuestionContent } from "./question-card/QuestionContent";
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
  const [expandedFeedback, setExpandedFeedback] = useState(true); // Default to expanded

  if (!question) {
    return <QuestionLoading />;
  }

  return (
    <Card className="w-full overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 rounded-xl">
      <div className="space-y-6">
        {showFeedback && selectedAnswer ? (
          <QuestionFeedback 
            question={question}
            selectedAnswer={selectedAnswer}
            explanations={explanations}
            isGeneratingExplanation={isGeneratingExplanation}
            expandedFeedback={expandedFeedback}
            onToggleFeedback={() => setExpandedFeedback(!expandedFeedback)}
          />
        ) : (
          <QuestionContent
            question={question}
            currentIndex={currentIndex}
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
    </Card>
  );
}
