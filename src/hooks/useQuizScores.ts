
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
          .eq('quiz_id', supabase.from('quizzes').select('id').eq('course_id', courseId))
          .order('completed_at', { ascending: false });

        if (responsesError) {
          console.error('Error fetching quiz responses:', responsesError);
          throw responsesError;
        }

        // Set performance data
        if (performanceData) {
          setPerformance(performanceData);
        } else if (responses && responses.length > 0) {
          // If no performance entry but we have responses, create performance data
          // Calculate average score
          const totalScore = responses.reduce((acc, curr) => acc + curr.score, 0);
          const avgScore = responses.length > 0 ? totalScore / responses.length : 0;
          
          // Create performance object
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
          // No performance data or quiz responses
          setPerformance(null);
        }

        // Format the quiz scores for display
        if (responses && responses.length > 0) {
          // Extract all quiz_ids from the responses
          const quizIds = responses.map(r => r.quiz_id).filter(Boolean);
          
          // Fetch corresponding quiz titles
          const { data: quizTitles, error: quizTitlesError } = await supabase
            .from('quizzes')
            .select('id, title')
            .in('id', quizIds);
          
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
              title: quizMap[response.quiz_id] || `Quiz ${response.quiz_id.slice(0, 8)}`
            }
          }));
          
          setQuizScores(formattedScores);
        } else {
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
    performance,
    quizScores,
    isLoading,
    courseName
  };
}
