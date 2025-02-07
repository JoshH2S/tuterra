
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Get quiz response
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select(`
            *,
            quiz:quizzes(title)
          `)
          .eq('id', id)
          .single();

        if (responseError) throw responseError;
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

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title} - Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">
              {results.correct_answers} / {results.total_questions}
            </p>
            <p className="text-lg text-muted-foreground">
              Correct Answers
            </p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">
              {percentageScore.toFixed(1)}%
            </p>
            <p className="text-lg text-muted-foreground">
              Score
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
