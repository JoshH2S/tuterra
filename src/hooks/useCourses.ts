
import { useState, useEffect } from "react";
import { useCourseCreate } from "./useCourseCreate";
import { useCourseFileUpload } from "./useCourseFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";
import { toast } from "@/hooks/use-toast";

export const useCourses = () => {
  const { createCourse } = useCourseCreate();
  const { handleFileUpload } = useCourseFileUpload();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
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
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    createCourse,
    handleFileUpload,
    courses,
    isLoading,
    refreshCourses: fetchCourses,
  };
};
