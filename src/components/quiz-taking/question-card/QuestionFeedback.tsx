
import React, { useState, useEffect } from "react";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizAnswerFeedback } from "../QuizAnswerFeedback";

interface QuestionFeedbackProps {
  question: QuizQuestion;
  selectedAnswer: string;
  explanations: Record<string, string>;
  isGeneratingExplanation: boolean;
  expandedFeedback: boolean;
  onToggleFeedback: () => void;
}

export function QuestionFeedback({
  question,
  selectedAnswer,
  explanations,
  isGeneratingExplanation,
  expandedFeedback,
  onToggleFeedback
}: QuestionFeedbackProps) {
  // Always start with expanded feedback to show full explanation
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Initialize with expanded state from props, but default to true
  useEffect(() => {
    setIsExpanded(expandedFeedback || true);
  }, [expandedFeedback]);
  
  const handleToggleFeedback = () => {
    setIsExpanded(!isExpanded);
    onToggleFeedback();
  };

  return (
    <QuizAnswerFeedback 
      question={question}
      userAnswer={selectedAnswer}
      isCorrect={selectedAnswer === question.correct_answer}
      explanation={explanations[question.id]}
      isLoading={isGeneratingExplanation}
      expanded={isExpanded}
      onToggle={handleToggleFeedback}
    />
  );
}
