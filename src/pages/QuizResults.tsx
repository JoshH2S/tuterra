
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/quiz-results/ScoreCard";
import { StatisticsCard } from "@/components/quiz-results/StatisticsCard";
import { TopicPerformance } from "@/components/quiz-results/TopicPerformance";
import { DetailedFeedback } from "@/components/quiz-results/DetailedFeedback";

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select(`
            *,
            quiz:quizzes(
              id,
              title,
              allow_retakes
            )
          `)
          .eq('id', id)
          .single();

        if (responseError) throw responseError;
        console.log("Quiz response data:", responseData);
        
        // Log for debugging
        if (responseData?.ai_feedback) {
          console.log("AI Feedback:", responseData.ai_feedback);
        }
        
        setResults(responseData);
        setQuiz(responseData.quiz);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching results:', error);
        setError(error.message || 'Failed to load quiz results');
        toast({
          title: "Error",
          description: "Failed to load quiz results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResults();
    }
  }, [id]);

  if (loading) return (
    <div className="container mx-auto py-12 text-center">
      <p className="text-lg">Loading quiz results...</p>
    </div>
  );

  if (error || !results || !quiz) return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Results</h1>
        <p>{error || "Could not find the requested quiz results."}</p>
        <Button onClick={() => navigate('/quizzes')}>
          Return to Quizzes
        </Button>
      </div>
    </div>
  );

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

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-2 text-[#091747]">{quiz.title}</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Here's how you performed on this quiz
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <ScoreCard 
            percentageScore={percentageScore}
            getPerformanceMessage={getPerformanceMessage}
          />
          <StatisticsCard 
            correctAnswers={results.correct_answers}
            totalQuestions={results.total_questions}
          />
        </div>

        {results.topic_performance && (
          <TopicPerformance topics={results.topic_performance} />
        )}
        
        <DetailedFeedback feedback={results.ai_feedback} />

        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/quizzes')}
            className="min-w-[140px]"
          >
            Back to Quizzes
          </Button>
          {quiz.allow_retakes && (
            <Button
              onClick={() => navigate(`/take-quiz/${quiz.id}`)}
              className="min-w-[140px]"
            >
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
