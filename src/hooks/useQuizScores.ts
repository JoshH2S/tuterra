
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

        // Fetch performance data for this course
        const { data: performanceData, error: performanceError } = await supabase
          .from('student_performance')
          .select(`
            id,
            student_id,
            course_id,
            total_quizzes,
            completed_quizzes,
            average_score,
            last_activity,
            strengths,
            areas_for_improvement,
            courses(
              title
            )
          `)
          .eq('student_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (performanceError && performanceError.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching performance:', performanceError);
          throw performanceError;
        }

        // Get quiz ids associated with this course
        const { data: courseQuizIds, error: courseQuizError } = await supabase
          .from('quizzes')
          .select('id')
          .eq('course_id', courseId);
        
        if (courseQuizError) {
          console.error('Error fetching course quizzes:', courseQuizError);
          throw courseQuizError;
        }

        // Convert the quiz IDs to an array of strings
        const quizIdArray = courseQuizIds.map(item => item.id);

        // Get quiz responses for detailed quiz history
        const { data: responses, error: responsesError } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            quiz_id,
            score,
            total_questions,
            completed_at
          `)
          .eq('student_id', user.id)
          .not('completed_at', 'is', null)
          .in('quiz_id', quizIdArray.length > 0 ? quizIdArray : ['no-quizzes'])
          .order('completed_at', { ascending: false });

        if (responsesError) {
          console.error('Error fetching quiz responses:', responsesError);
          throw responsesError;
        }

        // Extract quiz IDs, ensuring they are strings
        const quizIds = responses
          .map(r => r.quiz_id)
          .filter((id): id is string => typeof id === 'string');
        
        // Fetch corresponding quiz titles
        const { data: quizTitles, error: quizTitlesError } = await supabase
          .from('quizzes')
          .select('id, title')
          .in('id', quizIds.length > 0 ? quizIds : ['no-quizzes']);
        
        if (quizTitlesError) {
          console.error('Error fetching quiz titles:', quizTitlesError);
        }
        
        // Map quiz IDs to their titles
        const quizMap = Object.fromEntries(
          (quizTitles || []).map(quiz => [quiz.id, quiz.title])
        );
        
        // Format scores and insert actual titles
        const formattedScores = responses.map(response => ({
          id: response.id,
          quiz_id: response.quiz_id,
          score: response.score,
          max_score: 100, // Scores are stored as percentages
          taken_at: response.completed_at || new Date().toISOString(),
          quiz: {
            title: quizMap[String(response.quiz_id)] || `Quiz ${String(response.quiz_id).slice(0, 8)}`
          }
        }));
        
        setQuizScores(formattedScores);
        setPerformance(performanceData);
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
