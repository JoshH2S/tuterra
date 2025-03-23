
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudentCourse, StudentPerformance } from "@/types/student";
import { toast } from "@/hooks/use-toast";

export const useStudentDashboard = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [performance, setPerformance] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a single batch request for both queries
      const [coursesResult, performanceResult] = await Promise.all([
        // Fetch enrolled courses - only select needed fields
        supabase
          .from('student_courses')
          .select(`
            id,
            student_id,
            course_id,
            enrolled_at,
            last_accessed,
            status,
            course:courses(
              title,
              description
            )
          `)
          .eq('student_id', user.id),
          
        // Fetch performance data - only select needed fields  
        supabase
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
            courses (
              title
            )
          `)
          .eq('student_id', user.id)
      ]);
      
      // Check for errors
      if (coursesResult.error) throw coursesResult.error;
      if (performanceResult.error) throw performanceResult.error;

      // Type guard to ensure status is one of the allowed values and student_id is included
      const typedCoursesData = coursesResult.data?.map(course => ({
        ...course,
        student_id: course.student_id || user.id, // Ensure student_id is included
        status: course.status as StudentCourse['status']
      })) || [];

      // Transform and type the performance data
      const transformedPerformanceData: StudentPerformance[] = (performanceResult.data || []).map(p => ({
        id: p.id,
        student_id: p.student_id || user.id, // Ensure student_id is included
        course_id: p.course_id,
        total_quizzes: p.total_quizzes || 0,
        completed_quizzes: p.completed_quizzes || 0,
        average_score: Number(p.average_score) || 0, // Ensure we convert to number
        last_activity: p.last_activity,
        course_title: p.courses?.title || 'Unnamed Course',
        courses: p.courses,
        strengths: p.strengths || [],
        areas_for_improvement: p.areas_for_improvement || []
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
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { courses, performance, isLoading, refreshData: fetchDashboardData };
};
