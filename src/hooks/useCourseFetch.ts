
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";

export const useCourseFetch = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }

      const { data: coursesData, error: supabaseError } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      setCourses(coursesData || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return { courses, isLoading, error, setCourses };
};
