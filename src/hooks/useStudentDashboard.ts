
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
            id,
            course_id,
            student_id,
            enrolled_at,
            last_accessed,
            status::text,
            course:courses(
              title,
              description
            )
          `)
          .eq('student_id', user.id);

        if (coursesError) throw coursesError;

        // Type guard to ensure status is one of the allowed values
        const typedCoursesData = coursesData?.map(course => ({
          ...course,
          status: course.status as StudentCourse['status']
        })) || [];

        // Fetch performance data with course titles
        const { data: performanceData, error: performanceError } = await supabase
          .from('student_performance')
          .select(`
            *,
            courses (
              title
            )
          `)
          .eq('student_id', user.id);

        if (performanceError) throw performanceError;

        // Transform and type the performance data
        const transformedPerformanceData: StudentPerformance[] = (performanceData || []).map(p => ({
          id: p.id,
          student_id: p.student_id,
          course_id: p.course_id,
          total_quizzes: p.total_quizzes,
          completed_quizzes: p.completed_quizzes,
          average_score: p.average_score,
          last_activity: p.last_activity,
          course_title: p.courses?.title || 'Unnamed Course',
          courses: p.courses
        }));

        setCourses(typedCoursesData);
        setPerformance(transformedPerformanceData);
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
