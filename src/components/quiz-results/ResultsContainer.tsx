
import React from "react";
import { ResultsHeader } from "./ResultsHeader";
import { StatsCard } from "./StatsCard";
import { CircularProgress } from "@/components/ui/circular-progress";
import { TopicPerformanceCard } from "./TopicPerformanceCard";
import { DetailedFeedback } from "./DetailedFeedback";
import { FeedbackGenerateButton } from "./FeedbackGenerateButton";
import { ResultActions } from "./ResultActions";
import { CheckCircle, XCircle, ListChecks } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizResponse, Quiz } from "@/types/quiz-results";
import { ResultsError } from "./ResultsError";

interface ResultsContainerProps {
  results: QuizResponse;
  quiz: Quiz;
  generateFeedback: () => void;
  generatingFeedback: boolean;
}

export function ResultsContainer({ 
  results, 
  quiz,
  generateFeedback,
  generatingFeedback 
}: ResultsContainerProps) {
  const isMobile = useIsMobile();
  
  // Make sure we have valid results
  if (!results || !quiz) {
    return <ResultsError error="Missing quiz results data" />;
  }
  
  // Calculate percentage score correctly
  const percentageScore = results.total_questions > 0 
    ? Math.round((results.correct_answers / results.total_questions) * 100) 
    : 0;

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good work!";
    if (score >= 60) return "Nice effort!";
    return "Keep practicing";
  };

  // Check if we have meaningful feedback
  const hasStrengths = results.ai_feedback?.strengths?.length > 0 && 
    results.ai_feedback.strengths[0] !== "";
  const hasAreasForImprovement = results.ai_feedback?.areas_for_improvement?.length > 0 && 
    results.ai_feedback.areas_for_improvement[0] !== "";
  const hasAdvice = results.ai_feedback?.advice && 
    results.ai_feedback.advice !== "";
  
  const hasMeaningfulFeedback = hasStrengths || hasAreasForImprovement || hasAdvice;
  const isGeneratingMessage = results.ai_feedback?.strengths?.[0] === "Generating feedback...";
  const shouldShowGenerateButton = !hasMeaningfulFeedback || isGeneratingMessage;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-4 sm:px-6 space-y-8">
        {/* Header */}
        <ResultsHeader title={quiz.title} />
        
        {/* Hero Section with Score */}
        <div className="relative flex flex-col items-center bg-gradient-to-b from-primary/10 to-transparent rounded-2xl p-8">
          <div className="relative">
            <CircularProgress 
              percentage={percentageScore} 
              size={isMobile ? 200 : 240}
              strokeWidth={12}
              className="text-primary"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                {percentageScore}%
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getPerformanceMessage(percentageScore)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <StatsCard 
            title="Correct Answers"
            value={results.correct_answers}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            className="bg-green-50 dark:bg-green-900/10"
          />
          <StatsCard 
            title="Total Questions"
            value={results.total_questions}
            icon={<ListChecks className="h-5 w-5 text-blue-500" />}
            className="bg-blue-50 dark:bg-blue-900/10"
          />
          <StatsCard 
            title="Incorrect Answers"
            value={results.total_questions - results.correct_answers}
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            className="bg-red-50 dark:bg-red-900/10"
          />
        </div>
        
        {/* Topic Performance */}
        {results.topic_performance && Object.keys(results.topic_performance).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TopicPerformanceCard topics={results.topic_performance} />
          </div>
        )}
        
        {/* AI Feedback Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <DetailedFeedback 
            feedback={results.ai_feedback} 
            isGenerating={generatingFeedback}
          />
          
          {shouldShowGenerateButton && !generatingFeedback && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <FeedbackGenerateButton 
                onGenerate={generateFeedback}
                isGenerating={generatingFeedback}
              />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="pt-4">
          <ResultActions 
            quizId={quiz.id} 
            quizTitle={quiz.title}
            allowRetakes={quiz.allow_retakes}
            previousScore={percentageScore}
          />
        </div>
      </div>
    </div>
  );
}
