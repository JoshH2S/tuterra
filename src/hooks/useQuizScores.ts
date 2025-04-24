import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StudentPerformance } from "@/types/student";

export function useQuizScores(courseId: string | undefined) {
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [quizScores, setQuizScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!courseId) return;
      
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

        const { data: responses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            quiz_id,
            score,
            total_questions,
            completed_at,
            quiz (
              title,
              course_id
            )
          `)
          .eq('student_id', user.id)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false });

        if (responsesError) {
          console.error('Error fetching quiz responses:', responsesError);
          throw responsesError;
        }

        if (responses && responses.length > 0) {
          const formattedScores = responses.map(response => ({
            id: response.id,
            quiz_id: response.quiz_id,
            score: response.score,
            max_score: 100,
            taken_at: response.completed_at || new Date().toISOString(),
            quiz: {
              title: response.quiz?.title || 'Unknown Quiz'
            }
          }));

          console.log('Formatted quiz scores with titles:', formattedScores);

          setQuizScores(formattedScores);
        } else {
          setQuizScores([]);
        }

        if (performanceData) {
          setPerformance(performanceData);
        } else if (responses && responses.length > 0) {
          const totalScore = responses.reduce((acc, curr) => acc + curr.score, 0);
          const avgScore = responses.length > 0 ? totalScore / responses.length : 0;
          
          const syntheticPerformance: StudentPerformance = {
            id: 'synthetic',
            student_id: user.id,
            course_id: courseId,
            total_quizzes: responses.length,
            completed_quizzes: responses.length,
            average_score: avgScore,
            last_activity: responses[0].completed_at,
            course_title: courseData?.title || 'Unknown Course',
            courses: courseData ? { title: courseData.title } : undefined
          };
          
          setPerformance(syntheticPerformance);
        } else {
          setPerformance(null);
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

    fetchGrades();
  }, [courseId]);

  return {
    performance,
    quizScores,
    isLoading,
    courseName
  };
}
