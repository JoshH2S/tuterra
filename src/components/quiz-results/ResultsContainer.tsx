
import React from "react";
import { ResultsHeader } from "./ResultsHeader";
import { ScoreCircle } from "./ScoreCircle";
import { StatsCardGrid } from "./StatsCardGrid";
import { TopicPerformanceCard } from "./TopicPerformanceCard";
import { FeedbackSection } from "./FeedbackSection";
import { ResultActions } from "./ResultActions";
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
  // Make sure we have valid results
  if (!results || !quiz) {
    return <ResultsError error="Missing quiz results data" />;
  }
  
  // Calculate percentage score correctly
  const percentageScore = results.total_questions > 0 
    ? Math.round((results.correct_answers / results.total_questions) * 100) 
    : 0;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-4 sm:px-6 space-y-8">
        {/* Header */}
        <ResultsHeader title={quiz.title} />
        
        {/* Hero Section with Score */}
        <ScoreCircle percentageScore={percentageScore} />
        
        {/* Stats Cards */}
        <StatsCardGrid 
          correctAnswers={results.correct_answers} 
          totalQuestions={results.total_questions} 
        />
        
        {/* Topic Performance */}
        {results.topic_performance && Object.keys(results.topic_performance).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <TopicPerformanceCard topics={results.topic_performance} />
          </div>
        )}
        
        {/* AI Feedback Section */}
        <FeedbackSection 
          feedback={results.ai_feedback}
          generateFeedback={generateFeedback}
          generatingFeedback={generatingFeedback}
        />
        
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
