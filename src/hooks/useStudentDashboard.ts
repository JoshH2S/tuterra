
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudentCourse, StudentPerformance } from "@/types/student";
import { toast } from "@/hooks/use-toast";

export const useStudentDashboard = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch enrolled courses with course details
        const { data: coursesData, error: coursesError } = await supabase
          .from('student_courses')
          .select(`
            *,
            course:courses(
              title,
              description
            )
          `)
          .eq('student_id', user.id);

        if (coursesError) throw coursesError;

        // Fetch performance data
        const { data: performanceData, error: performanceError } = await supabase
          .from('student_performance')
          .select('*')
          .eq('student_id', user.id);

        if (performanceError) throw performanceError;

        setCourses(coursesData || []);
        setPerformance(performanceData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { courses, performance, isLoading };
};
