
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseCreateData } from "@/types/course";

export const useCourseCreate = () => {
  const createCourse = async (data: CourseCreateData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create a course object with all required fields
      const courseData = { 
        title: data.title,
        user_id: user.id,
        // Add optional fields only if they exist
        ...(data.description ? { description: data.description } : {}),
        ...(data.code ? { code: data.code } : {})
      };

      const { error: courseError } = await supabase
        .from('courses')
        .insert(courseData);

      if (courseError) {
        console.error('Course creation error:', courseError);
        throw courseError;
      }
      
      toast({
        title: "Course created",
        description: `${data.title} has been created successfully.`,
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
