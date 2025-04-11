
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const navigate = useNavigate();
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [courseGrade, setCourseGrade] = useState<CourseGrade>({
    total_quizzes: 0,
    average_grade: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view course grades",
            variant: "destructive",
          });
          return;
        }

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();

        if (courseError) {
          console.error('Error fetching course:', courseError);
        } else if (courseData) {
          setCourseName(courseData.title);
        }

        // Get quiz responses directly to ensure we have the most accurate data
        const { data: responses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            quiz_id,
            score,
            total_questions,
            completed_at,
            quizzes(
              title,
              course_id
            )
          `)
          .eq('student_id', user.id)
          .neq('completed_at', null) // Only completed quizzes
          .order('completed_at', { ascending: false });

        if (responsesError) {
          throw responsesError;
        }

        // Filter to only include quizzes from the current course
        const courseResponses = responses?.filter(
          r => r.quizzes && r.quizzes.course_id === courseId
        ) || [];
        
        if (courseResponses.length > 0) {
          // Calculate average grade
          const totalScores = courseResponses.reduce(
            (acc, curr) => acc + ((curr.score / 100) * 100), 
            0
          );
          const averageGrade = totalScores / courseResponses.length;
          
          setCourseGrade({
            total_quizzes: courseResponses.length,
            average_grade: averageGrade
          });

          // Format the data for display
          const formattedScores = courseResponses.map(response => ({
            id: response.id,
            quiz_id: response.quiz_id,
            score: response.score,
            max_score: 100, // Scores are stored as percentages
            taken_at: response.completed_at || new Date().toISOString(),
            quiz: {
              title: response.quizzes?.title || 'Unknown Quiz'
            }
          }));

          setQuizScores(formattedScores);
        } else {
          setCourseGrade({
            total_quizzes: 0,
            average_grade: 0
          });
          setQuizScores([]);
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        toast({
          title: "Error",
          description: "Failed to load grade data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchGrades();
    }
  }, [courseId]);

  const handleBack = () => {
    navigate('/courses');
  };

  if (isLoading) {
    return <AdaptiveLoading />;
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-4 sm:space-y-6 px-4 w-full max-w-full">
      <Button 
        onClick={handleBack} 
        className="mb-4 pl-1 flex items-center touch-manipulation hover:bg-gradient-to-br hover:from-primary-100/80 hover:to-primary-200/80 hover:text-black"
        size="sm"
        aria-label="Back to courses"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        <span>Back to Courses</span>
      </Button>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{courseName || "Course"} Grades</h1>
      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">View your quiz performance for this course</p>

      {courseGrade && (
        <Card className="bg-primary/5 w-full">
          <CardHeader>
            <CardTitle>Course Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
                <p className="text-xl sm:text-2xl font-bold">{courseGrade.total_quizzes}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Average</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {courseGrade.average_grade.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Quiz History</h2>
        {quizScores.length === 0 ? (
          <Card className="w-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No quizzes taken yet
            </CardContent>
          </Card>
        ) : (
          quizScores.map((score) => (
            <Card 
              key={score.id} 
              className="hover:shadow-md transition-shadow w-full touch-manipulation"
            >
              <CardContent className="py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                  <div>
                    <h3 className="font-medium">{score.quiz.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Taken on {format(new Date(score.taken_at), 'PPP')}
                    </p>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="text-xl sm:text-2xl font-bold">
                      {((score.score / score.max_score) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
