import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  GeneratedCourse, 
  CourseModule, 
  CreateCourseRequest, 
  FormatPreferences,
  CourseLevel 
} from '@/types/course-engine';

interface CourseWithProgress extends GeneratedCourse {
  progress?: number;
}

interface UseGeneratedCoursesReturn {
  courses: CourseWithProgress[];
  isLoading: boolean;
  isCreating: boolean;
  error: Error | null;
  fetchCourses: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  createCourse: (data: CreateCourseRequest) => Promise<{ course: GeneratedCourse; modules: CourseModule[] } | null>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  getCourseProgress: (courseId: string) => number;
}

export const useGeneratedCourses = (): UseGeneratedCoursesReturn => {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async () => {
    console.log('[useGeneratedCourses] Starting to fetch courses...');
    const startTime = performance.now();
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useGeneratedCourses] Getting authenticated user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[useGeneratedCourses] No authenticated user found');
        throw new Error('Not authenticated');
      }
      console.log('[useGeneratedCourses] User authenticated:', user.id);

      console.log('[useGeneratedCourses] Fetching courses from database...');
      const { data, error: fetchError } = await supabase
        .from('generated_courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[useGeneratedCourses] Error fetching courses:', fetchError);
        throw fetchError;
      }
      console.log(`[useGeneratedCourses] Found ${data?.length || 0} courses`);
      
      // Fetch progress data for all courses
      console.log('[useGeneratedCourses] Fetching progress data...');
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('course_id, total_steps_completed')
        .eq('user_id', user.id);

      if (progressError) {
        console.warn('[useGeneratedCourses] Error fetching progress data:', progressError);
      } else {
        console.log(`[useGeneratedCourses] Found progress data for ${progressData?.length || 0} courses`);
      }

      // Fetch module counts for each course
      console.log('[useGeneratedCourses] Fetching modules data...');
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('course_id, is_completed');

      if (modulesError) {
        console.warn('[useGeneratedCourses] Error fetching modules data:', modulesError);
      } else {
        console.log(`[useGeneratedCourses] Found ${modulesData?.length || 0} total modules`);
      }

      // Create progress map
      const progressMap = new Map<string, number>();
      if (modulesData) {
        // Group modules by course
        const courseModules = modulesData.reduce((acc, mod) => {
          if (!acc[mod.course_id]) acc[mod.course_id] = [];
          acc[mod.course_id].push(mod);
          return acc;
        }, {} as Record<string, typeof modulesData>);

        console.log(`[useGeneratedCourses] Grouped modules into ${Object.keys(courseModules).length} courses`);

        // Calculate progress percentage for each course
        Object.entries(courseModules).forEach(([courseId, modules]) => {
          if (modules.length > 0) {
            const completedCount = modules.filter(m => m.is_completed).length;
            const percentage = Math.round((completedCount / modules.length) * 100);
            progressMap.set(courseId, percentage);
            console.log(`[useGeneratedCourses] Course ${courseId}: ${completedCount}/${modules.length} modules complete (${percentage}%)`);
          }
        });
      }
      
      // Transform the data to match our types
      console.log('[useGeneratedCourses] Transforming courses data...');
      const transformedCourses: CourseWithProgress[] = (data || []).map(course => ({
        id: course.id,
        user_id: course.user_id,
        topic: course.topic,
        goal: course.goal || undefined,
        title: course.title,
        description: course.description || undefined,
        level: course.level as CourseLevel,
        pace_weeks: course.pace_weeks,
        format_preferences: (course.format_preferences || {}) as FormatPreferences,
        learning_objectives: Array.isArray(course.learning_objectives) 
          ? course.learning_objectives as unknown as GeneratedCourse['learning_objectives']
          : [],
        status: course.status as GeneratedCourse['status'],
        context_summary: course.context_summary || undefined,
        created_at: course.created_at,
        updated_at: course.updated_at,
        progress: progressMap.get(course.id) || 0,
      }));
      
      console.log(`[useGeneratedCourses] Successfully transformed ${transformedCourses.length} courses`);
      setCourses(transformedCourses);
      
      const endTime = performance.now();
      console.log(`[useGeneratedCourses] ✅ Fetch completed successfully in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (err) {
      const endTime = performance.now();
      console.error(`[useGeneratedCourses] ❌ Error fetching courses (${(endTime - startTime).toFixed(2)}ms):`, err);
      setError(err instanceof Error ? err : new Error('Failed to load courses'));
      toast({
        title: 'Error',
        description: 'Failed to load your courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log('[useGeneratedCourses] Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (data: CreateCourseRequest) => {
    console.log('[useGeneratedCourses] Creating course with data:', data);
    setIsCreating(true);
    setError(null);

    try {
      console.log('[useGeneratedCourses] Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[useGeneratedCourses] No session found');
        throw new Error('Not authenticated');
      }

      console.log('[useGeneratedCourses] Invoking generate-course edge function...');
      const response = await supabase.functions.invoke('generate-course', {
        body: data,
      });

      if (response.error) {
        console.error('[useGeneratedCourses] Edge function returned error:', response.error);
        throw new Error(response.error.message || 'Failed to generate course');
      }

      const result = response.data;
      console.log('[useGeneratedCourses] Edge function response:', result);

      if (!result.success) {
        console.error('[useGeneratedCourses] Course generation failed:', result.error);
        throw new Error(result.error || 'Failed to generate course');
      }

      console.log('[useGeneratedCourses] ✅ Course created successfully:', result.course.title);
      toast({
        title: 'Course Created!',
        description: `"${result.course.title}" is ready. Start learning!`,
      });

      // Refresh the courses list
      console.log('[useGeneratedCourses] Refreshing courses list...');
      await fetchCourses();

      return {
        course: result.course,
        modules: result.modules,
      };
    } catch (err) {
      console.error('[useGeneratedCourses] ❌ Error creating course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      console.log('[useGeneratedCourses] Setting isCreating to false');
      setIsCreating(false);
    }
  }, [fetchCourses]);

  const deleteCourse = useCallback(async (courseId: string) => {
    console.log(`[useGeneratedCourses] Deleting course: ${courseId}`);
    try {
      const { error: deleteError } = await supabase
        .from('generated_courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) {
        console.error('[useGeneratedCourses] Delete error:', deleteError);
        throw deleteError;
      }

      console.log(`[useGeneratedCourses] ✅ Course deleted successfully: ${courseId}`);
      setCourses(prev => {
        const newCourses = prev.filter(c => c.id !== courseId);
        console.log(`[useGeneratedCourses] Updated courses count: ${newCourses.length}`);
        return newCourses;
      });
      
      toast({
        title: 'Course Deleted',
        description: 'The course has been removed.',
      });

      return true;
    } catch (err) {
      console.error('[useGeneratedCourses] ❌ Error deleting course:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete course. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const getCourseProgress = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const progress = course?.progress || 0;
    console.log(`[useGeneratedCourses] Getting progress for course ${courseId}: ${progress}%`);
    return progress;
  }, [courses]);

  return {
    courses,
    isLoading,
    isCreating,
    error,
    fetchCourses,
    refreshCourses: fetchCourses,
    createCourse,
    deleteCourse,
    getCourseProgress,
  };
};
