
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/course";
import { useCourses } from "@/hooks/useCourses";
import { Loader2 } from "lucide-react";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";

interface Quiz {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  allow_retakes: boolean;
  profiles: {
    first_name: string;
    last_name: string;
  };
  latest_response?: {
    id: string;
    score: number;
    total_questions: number;
    attempt_number: number;
  };
}

interface QuizzesByCourse {
  [courseId: string]: Quiz[];
}

export default function Quizzes() {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const [loading, setLoading] = useState(true);
  const [confirmRetakeQuiz, setConfirmRetakeQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();
  const { courses } = useCourses();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            profiles:teacher_id (
              first_name,
              last_name
            ),
            quiz_responses!quiz_responses_quiz_id_fkey (
              id,
              score,
              total_questions,
              attempt_number
            )
          `)
          .eq('published', true);

        if (error) throw error;

        const quizzesByCourseTmp: QuizzesByCourse = {};
        data.forEach((quiz: any) => {
          // Sort responses by attempt number in descending order to get the latest one
          const sortedResponses = quiz.quiz_responses.sort((a: any, b: any) => 
            b.attempt_number - a.attempt_number
          );
          
          // Get only the latest response (first one after sorting)
          const latestResponse = sortedResponses.length > 0 ? sortedResponses[0] : undefined;
          
          const processedQuiz: Quiz = {
            ...quiz,
            latest_response: latestResponse,
          };

          if (!quizzesByCourseTmp[quiz.course_id]) {
            quizzesByCourseTmp[quiz.course_id] = [];
          }
          quizzesByCourseTmp[quiz.course_id].push(processedQuiz);
        });
        setQuizzesByCourse(quizzesByCourseTmp);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast({
          title: "Error",
          description: "Failed to load quizzes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleQuizAction = (quiz: Quiz) => {
    if (quiz.latest_response) {
      navigate(`/quiz-results/${quiz.latest_response.id}`);
    } else {
      navigate(`/take-quiz/${quiz.id}`);
    }
  };

  const handleRetakeQuiz = (quiz: Quiz) => {
    if (quiz.latest_response) {
      setConfirmRetakeQuiz(quiz);
    } else {
      navigate(`/take-quiz/${quiz.id}`);
    }
  };

  const handleRetakeConfirm = () => {
    if (confirmRetakeQuiz) {
      navigate(`/take-quiz/${confirmRetakeQuiz.id}`);
      setConfirmRetakeQuiz(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Available Quizzes</h1>
      </div>
      
      {courses.map((course) => {
        const courseQuizzes = quizzesByCourse[course.id] || [];
        if (courseQuizzes.length === 0) return null;

        return (
          <div key={course.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courseQuizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Teacher: {quiz.profiles.first_name} {quiz.profiles.last_name}
                    </p>
                    {quiz.duration_minutes > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Duration: {quiz.duration_minutes} minutes
                      </p>
                    )}
                    {quiz.latest_response && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Previous Score: {quiz.latest_response.score}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Attempt #{quiz.latest_response.attempt_number}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => handleQuizAction(quiz)}
                      >
                        {quiz.latest_response ? 'View Results' : 'Take Quiz'}
                      </Button>
                      {quiz.latest_response && quiz.allow_retakes && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleRetakeQuiz(quiz)}
                        >
                          Retake Quiz
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {confirmRetakeQuiz && (
        <RetakeConfirmDialog
          open={!!confirmRetakeQuiz}
          onOpenChange={(open) => {
            if (!open) setConfirmRetakeQuiz(null);
          }}
          onConfirm={handleRetakeConfirm}
          quizTitle={confirmRetakeQuiz.title}
          previousScore={confirmRetakeQuiz.latest_response ? 
            confirmRetakeQuiz.latest_response.score : 
            undefined}
        />
      )}
    </div>
  );
}
