
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

  // Check if we have meaningful feedback (not just empty arrays/strings)
  const hasStrengths = results.ai_feedback?.strengths?.length > 0 && 
    results.ai_feedback.strengths[0] !== "";
  const hasAreasForImprovement = results.ai_feedback?.areas_for_improvement?.length > 0 && 
    results.ai_feedback.areas_for_improvement[0] !== "";
  const hasAdvice = results.ai_feedback?.advice && 
    results.ai_feedback.advice !== "";
  
  const hasMeaningfulFeedback = hasStrengths || hasAreasForImprovement || hasAdvice;
  // Don't show the "generating" message as meaningful feedback
  const isGeneratingMessage = results.ai_feedback?.strengths?.[0] === "Generating feedback...";
  const shouldShowGenerateButton = !hasMeaningfulFeedback || isGeneratingMessage;

  // Filter out generic strengths - focus on topic-specific feedback first
  const specificStrengths = results.ai_feedback?.strengths?.filter(
    (s: string) => s.includes("Strong understanding of")
  ) || [];
  
  // Filter out generic areas for improvement - focus on topic-specific feedback first
  const specificAreasForImprovement = results.ai_feedback?.areas_for_improvement?.filter(
    (a: string) => a.includes("Need to review")
  ) || [];

  // If we don't have any specific feedback, use the generic ones
  const displayStrengths = specificStrengths.length > 0 
    ? specificStrengths 
    : results.ai_feedback?.strengths || [];
    
  const displayAreasForImprovement = specificAreasForImprovement.length > 0
    ? specificAreasForImprovement
    : results.ai_feedback?.areas_for_improvement || [];

  // Update results object to prioritize topic-specific feedback
  const enhancedResults = {
    ...results,
    ai_feedback: results.ai_feedback ? {
      ...results.ai_feedback,
      strengths: displayStrengths,
      areas_for_improvement: displayAreasForImprovement
    } : null
  };

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
        feedback={enhancedResults.ai_feedback} 
        isGenerating={generatingFeedback}
      />
      
      {shouldShowGenerateButton && !generatingFeedback && (
        <FeedbackGenerateButton 
          onGenerate={generateFeedback}
          isGenerating={generatingFeedback}
        />
      )}

      <ResultActions 
        quizId={quiz.id} 
        quizTitle={quiz.title}
        allowRetakes={quiz.allow_retakes}
        previousScore={results.score || percentageScore}
      />
    </div>
  );
}
