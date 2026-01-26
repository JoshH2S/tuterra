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

interface UseGeneratedCoursesReturn {
  courses: GeneratedCourse[];
  isLoading: boolean;
  isCreating: boolean;
  error: Error | null;
  fetchCourses: () => Promise<void>;
  createCourse: (data: CreateCourseRequest) => Promise<{ course: GeneratedCourse; modules: CourseModule[] } | null>;
  deleteCourse: (courseId: string) => Promise<boolean>;
}

export const useGeneratedCourses = (): UseGeneratedCoursesReturn => {
  const [courses, setCourses] = useState<GeneratedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('generated_courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform the data to match our types
      const transformedCourses: GeneratedCourse[] = (data || []).map(course => ({
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
      }));
      
      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err : new Error('Failed to load courses'));
      toast({
        title: 'Error',
        description: 'Failed to load your courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (data: CreateCourseRequest) => {
    setIsCreating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('generate-course', {
        body: data,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate course');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate course');
      }

      toast({
        title: 'Course Created!',
        description: `"${result.course.title}" is ready. Start learning!`,
      });

      // Refresh the courses list
      await fetchCourses();

      return {
        course: result.course,
        modules: result.modules,
      };
    } catch (err) {
      console.error('Error creating course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [fetchCourses]);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('generated_courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) throw deleteError;

      setCourses(prev => prev.filter(c => c.id !== courseId));
      
      toast({
        title: 'Course Deleted',
        description: 'The course has been removed.',
      });

      return true;
    } catch (err) {
      console.error('Error deleting course:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete course. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  return {
    courses,
    isLoading,
    isCreating,
    error,
    fetchCourses,
    createCourse,
    deleteCourse,
  };
};
