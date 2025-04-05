
import { useState, useEffect, useCallback } from "react";
import { useCourseCreate } from "./useCourseCreate";
import { useCourseFileUpload } from "./useCourseFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseCreateData } from "@/types/course";
import { toast } from "@/hooks/use-toast";

export const useCourses = () => {
  const { createCourse: createCourseBase } = useCourseCreate();
  const { handleFileUpload } = useCourseFileUpload();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error instanceof Error ? error : new Error('Failed to load courses'));
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retryFetchCourses = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const loadCourses = async () => {
      if (!mounted) return;
      await fetchCourses();
    };
    
    loadCourses();
    
    return () => {
      mounted = false;
    };
  }, [fetchCourses, retryCount]);

  const createCourse = async (data: CourseCreateData) => {
    setIsCreating(true);
    try {
      const success = await createCourseBase(data);
      if (success) {
        await fetchCourses();
      }
      return success;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createCourse,
    handleFileUpload,
    courses,
    isLoading,
    isCreating,
    error,
    refreshCourses: fetchCourses,
    retryFetchCourses
  };
};
