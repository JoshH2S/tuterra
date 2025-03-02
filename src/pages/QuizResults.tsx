
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ScoreCard } from "@/components/quiz-results/ScoreCard";
import { StatisticsCard } from "@/components/quiz-results/StatisticsCard";
import { TopicPerformance } from "@/components/quiz-results/TopicPerformance";
import { DetailedFeedback } from "@/components/quiz-results/DetailedFeedback";
import { useIsMobile } from "@/hooks/use-mobile";

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [results, setResults] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

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
        } else {
          console.log("No AI feedback available yet");
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

  const generateFeedback = async () => {
    if (!id) return;
    
    try {
      setGeneratingFeedback(true);
      
      const { data, error } = await supabase.functions.invoke('generate-quiz-feedback', {
        body: { quizResponseId: id }
      });
      
      if (error) throw error;
      
      // Refetch the results to get the updated feedback
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .select(`*`)
        .eq('id', id)
        .single();
        
      if (responseError) throw responseError;
      
      // Update only the ai_feedback field in the results state
      setResults(prev => ({
        ...prev,
        ai_feedback: responseData.ai_feedback
      }));
      
      toast({
        title: "Success",
        description: "Feedback generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating feedback:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate feedback",
        variant: "destructive",
      });
    } finally {
      setGeneratingFeedback(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto py-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-lg mt-2">Loading quiz results...</p>
    </div>
  );

  if (error || !results || !quiz) return (
    <div className="container mx-auto py-8">
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
    <div className="container mx-auto py-8">
      <div className={`max-w-4xl mx-auto space-y-6 px-${isMobile ? '2' : '6'}`}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2 text-[#091747]`}>{quiz.title}</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Here's how you performed on this quiz
        </p>

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
        
        <DetailedFeedback feedback={results.ai_feedback} />
        
        {!results.ai_feedback && (
          <div className="flex justify-center">
            <Button 
              onClick={generateFeedback} 
              disabled={generatingFeedback}
              className="mt-2"
            >
              {generatingFeedback ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Feedback...
                </>
              ) : (
                "Generate AI Feedback"
              )}
            </Button>
          </div>
        )}

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
