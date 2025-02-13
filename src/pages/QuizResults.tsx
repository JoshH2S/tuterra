
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

  useEffect(() => {
    const fetchResults = async () => {
      try {
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
        console.log("AI Feedback:", responseData?.ai_feedback);
        setResults(responseData);
        setQuiz(responseData.quiz);

      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz results",
          variant: "destructive",
        });
      }
    };

    fetchResults();
  }, [id]);

  if (!results || !quiz) return <div>Loading...</div>;

  const percentageScore = ((results.score || 0) / (results.total_questions || 1)) * 100;

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent work!";
    if (score >= 80) return "Great job!";
    if (score >= 70) return "Good job!";
    return "Keep practicing";
  };

  // Ensure topic_performance is an array before mapping
  const topicPerformanceArray = Array.isArray(results.topic_performance) 
    ? results.topic_performance 
    : Object.entries(results.topic_performance || {}).map(([topic, data]: [string, any]) => ({
        topic,
        ...data
      }));

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto space-y-8">
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

        <TopicPerformance topics={topicPerformanceArray} />
        
        <DetailedFeedback feedback={results.ai_feedback} />

        <div className="flex justify-center gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/quizzes')}
          >
            Back to Quizzes
          </Button>
          {quiz.allow_retakes && (
            <Button
              onClick={() => navigate(`/take-quiz/${quiz.id}`)}
            >
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
