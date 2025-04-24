
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { StudentPerformance } from "@/types/student";

export interface QuizHistoryItem {
  id: string;
  title: string;
  scorePercent: number;
  takenAt: string;
}

export function useCourseQuizHistory(courseId: string | undefined) {
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState("");
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
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

        const { data: historyData, error: historyError } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            score,
            completed_at,
            quiz:quizzes!inner (
              title
            )
          `)
          .eq('student_id', user.id)
          .eq('quizzes.course_id', courseId)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false });

        if (historyError) {
          console.error('Error fetching quiz history:', historyError);
          setQuizHistory([]);
        } else if (historyData) {
          const formattedHistory = historyData.map(item => ({
            id: item.id,
            title: item.quiz?.title || 'Untitled Quiz',
            scorePercent: item.score ?? 0,
            takenAt: item.completed_at || new Date().toISOString(),
          }));
          setQuizHistory(formattedHistory);

          if (formattedHistory.length > 0) {
            const totalScore = formattedHistory.reduce((acc, curr) => acc + curr.scorePercent, 0);
            const avgScore = totalScore / formattedHistory.length;
            const syntheticPerformance: StudentPerformance = {
              id: `synthetic-${courseId}`,
              student_id: user.id,
              course_id: courseId,
              total_quizzes: formattedHistory.length,
              completed_quizzes: formattedHistory.length,
              average_score: avgScore,
              last_activity: formattedHistory[0].takenAt,
              course_title: courseName
            };
            setPerformance(syntheticPerformance);
          } else {
            setPerformance(null);
          }
        }

      } catch (error) {
        console.error('Error fetching course data:', error);
        toast({
          title: "Error",
          description: "Failed to load grade data",
          variant: "destructive",
        });
        setQuizHistory([]);
        setPerformance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, courseName]);

  return {
    quizHistory,
    isLoading,
    courseName,
    performance
  };
}
