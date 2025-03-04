
import { DetailedFeedback } from "./DetailedFeedback";
import { FeedbackGenerateButton } from "./FeedbackGenerateButton";
import { ResultActions } from "./ResultActions";
import { ResultsHeader } from "./ResultsHeader";
import { ScoreCard } from "./ScoreCard";
import { StatisticsCard } from "./StatisticsCard";
import { TopicPerformance } from "./TopicPerformance";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsContainerProps {
  results: any;
  quiz: any;
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
  
  // Calculate percentage score correctly
  const percentageScore = results.total_questions > 0 
    ? Math.round((results.correct_answers / results.total_questions) * 100) 
    : 0;

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent work!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good job!";
    return "Keep practicing";
  };

  // Ensure ai_feedback is properly structured
  const hasFeedback = results.ai_feedback && 
    (Array.isArray(results.ai_feedback.strengths) || 
     Array.isArray(results.ai_feedback.areas_for_improvement) || 
     results.ai_feedback.advice);

  return (
    <div className={`max-w-4xl mx-auto space-y-6 px-${isMobile ? '2' : '6'}`}>
      <ResultsHeader title={quiz.title} />

      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard 
          percentageScore={results.score || percentageScore}
          getPerformanceMessage={getPerformanceMessage}
        />
        <StatisticsCard 
          correctAnswers={results.correct_answers}
          totalQuestions={results.total_questions}
        />
      </div>

      {results.topic_performance && Object.keys(results.topic_performance).length > 0 && (
        <TopicPerformance topics={results.topic_performance} />
      )}
      
      <DetailedFeedback 
        feedback={results.ai_feedback} 
        isGenerating={generatingFeedback}
      />
      
      {!hasFeedback && (
        <FeedbackGenerateButton 
          onGenerate={generateFeedback}
          isGenerating={generatingFeedback}
        />
      )}

      <ResultActions quizId={quiz.id} allowRetakes={quiz.allow_retakes} />
    </div>
  );
}
