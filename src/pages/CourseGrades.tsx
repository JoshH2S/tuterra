
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface QuizScore {
  id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  taken_at: string;
  quiz: {
    title: string;
  };
}

interface CourseGrade {
  total_quizzes: number;
  average_grade: number;
}

export default function CourseGrades() {
  const { id: courseId } = useParams();
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [courseGrade, setCourseGrade] = useState<CourseGrade>({
    total_quizzes: 0,
    average_grade: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch individual quiz scores
        const { data: scores, error: scoresError } = await supabase
          .from('student_quiz_scores')
          .select(`
            id,
            quiz_id,
            score,
            max_score,
            taken_at,
            quiz:quizzes(title)
          `)
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .order('taken_at', { ascending: false });

        if (scoresError) throw scoresError;

        // Calculate course average
        if (scores && scores.length > 0) {
          const totalScores = scores.reduce((acc, curr) => acc + ((curr.score / curr.max_score) * 100), 0);
          const averageGrade = totalScores / scores.length;
          
          setCourseGrade({
            total_quizzes: scores.length,
            average_grade: averageGrade
          });
        }

        setQuizScores(scores || []);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrades();
  }, [courseId]);

  if (isLoading) {
    return <div>Loading grades...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Course Grades</h1>

      {courseGrade && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>Course Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
                <p className="text-2xl font-bold">{courseGrade.total_quizzes}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Average</p>
                <p className="text-2xl font-bold">
                  {courseGrade.average_grade.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quiz History</h2>
        {quizScores.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No quizzes taken yet
            </CardContent>
          </Card>
        ) : (
          quizScores.map((score) => (
            <Card key={score.id}>
              <CardContent className="py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{score.quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Taken on {format(new Date(score.taken_at), 'PPP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {((score.score / score.max_score) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {score.score} / {score.max_score} points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
