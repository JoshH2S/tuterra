import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function QuizResults() {
  const { id } = useParams();
  const [results, setResults] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select(`
            *,
            quiz:quizzes(title)
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
    return "Good attempt";
  };

  console.log("Current results state:", results);

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-2 text-[#091747]">{quiz.title}</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Here's how you performed on this quiz
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-primary text-white p-6">
            <CardContent className="space-y-4 pt-6">
              <div className="relative w-full aspect-square flex items-center justify-center">
                <div className="absolute inset 0">
                  <Progress 
                    value={percentageScore} 
                    className="h-full w-full rounded-full border-4 border-blue-500/20 bg-transparent"
                  />
                </div>
                <div className="text-center">
                  <span className="text-5xl font-bold block text-[#091747]">
                    {percentageScore.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-400">
                    {getPerformanceMessage(percentageScore)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-[#091747]">
                    {results.correct_answers}
                  </h3>
                  <p className="text-muted-foreground">
                    Correct Answers
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-[#091747]">
                    {results.total_questions}
                  </h3>
                  <p className="text-muted-foreground">
                    Total Questions
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-[#091747]">
                    {results.total_questions - results.correct_answers}
                  </h3>
                  <p className="text-muted-foreground">
                    Incorrect Answers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#091747]">Detailed Feedback</h2>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-[#091747]">Areas of Strength</h3>
              {results.ai_feedback?.strengths?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {results.ai_feedback.strengths.map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific strengths identified.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-[#091747]">Areas for Improvement</h3>
              {results.ai_feedback?.areas_for_improvement?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2">
                  {results.ai_feedback.areas_for_improvement.map((area: string, index: number) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No specific areas for improvement identified.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-[#091747]">Advice Going Forward</h3>
              {results.ai_feedback?.advice ? (
                <p>{results.ai_feedback.advice}</p>
              ) : (
                <p className="text-muted-foreground">No specific advice available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
