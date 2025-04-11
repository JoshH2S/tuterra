
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export function useQuizScores(courseId: string | undefined) {
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [courseGrade, setCourseGrade] = useState<CourseGrade>({
    total_quizzes: 0,
    average_grade: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

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

        // Fetch course name
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

    fetchGrades();
  }, [courseId]);

  return {
    quizScores,
    courseGrade,
    isLoading,
    courseName
  };
}
