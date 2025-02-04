import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";

export const useCourseCreate = (setCourses: React.Dispatch<React.SetStateAction<Course[]>>) => {
  const createCourse = async (title: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([{ 
          title,
          teacher_id: user.id
        }])
        .select()
        .single();

      if (courseError) throw courseError;

      const newCourse = courseData as Course;
      setCourses(prevCourses => [...prevCourses, newCourse]);
      
      toast({
        title: "Course created",
        description: `${title} has been created successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { createCourse };
};