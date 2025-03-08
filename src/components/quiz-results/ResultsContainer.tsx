
import React, { useState, useEffect } from "react";
import { ResultsHeader } from "./ResultsHeader";
import { StatsCard } from "./StatsCard";
import { CircularProgress } from "@/components/ui/circular-progress";
import { QuestionReviewCard } from "./QuestionReviewCard";
import { TopicPerformanceCard } from "./TopicPerformanceCard";
import { DetailedFeedback } from "./DetailedFeedback";
import { QuestionFilter } from "./QuestionFilter";
import { FeedbackGenerateButton } from "./FeedbackGenerateButton";
import { ResultActions } from "./ResultActions";
import { CheckCircle, XCircle, ListChecks } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizResponse, Quiz, ProcessedQuestion } from "@/types/quiz-results";
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
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState<ProcessedQuestion[]>([]);
  
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

  // Process questions and answers from results
  useEffect(() => {
    if (results && results.question_responses) {
      // Map questions with student answers in a more type-safe way
      const processedQuestions: ProcessedQuestion[] = results.question_responses
        .filter(resp => resp.question !== null)
        .map(resp => ({
          ...(resp.question as any), // Cast to any as a workaround for the type
          studentAnswer: resp.student_answer || "",
          isCorrect: resp.is_correct
        }));
      
      // Apply filtering
      let filtered = [...processedQuestions];
      
      if (filterType === "correct") {
        filtered = filtered.filter(q => q.isCorrect);
      } else if (filterType === "incorrect") {
        filtered = filtered.filter(q => !q.isCorrect);
      }
      
      setFilteredQuestions(filtered);
    }
  }, [results, filterType]);

  // Toggle question expansion
  const toggleQuestion = (index: number) => {
    setExpandedQuestion(prevIndex => prevIndex === index ? null : index);
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-4 sm:px-6">
        <ResultsHeader title={quiz.title} />
        
        {/* Hero Section with Score */}
        <div className="relative mb-8 mt-4 flex flex-col items-center">
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
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
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 mb-8">
          {/* Question Review Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Question Review
              </h2>
              <QuestionFilter 
                value={filterType} 
                onChange={setFilterType}
              />
            </div>
            
            {filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((question, index) => (
                  <QuestionReviewCard
                    key={index}
                    question={question}
                    userAnswer={question.studentAnswer}
                    isExpanded={expandedQuestion === index}
                    onToggle={() => toggleQuestion(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No questions match your filter. Try a different filter.
              </div>
            )}
          </div>
          
          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Topic Performance */}
            {results.topic_performance && Object.keys(results.topic_performance).length > 0 && (
              <TopicPerformanceCard topics={results.topic_performance} />
            )}
            
            {/* AI Feedback */}
            <DetailedFeedback 
              feedback={results.ai_feedback} 
              isGenerating={generatingFeedback}
            />
            
            {shouldShowGenerateButton && !generatingFeedback && (
              <FeedbackGenerateButton 
                onGenerate={generateFeedback}
                isGenerating={generatingFeedback}
              />
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <ResultActions 
          quizId={quiz.id} 
          quizTitle={quiz.title}
          allowRetakes={quiz.allow_retakes}
          previousScore={percentageScore}
        />
      </div>
    </div>
  );
}
