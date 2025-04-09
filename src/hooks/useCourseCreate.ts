
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseCreateData } from "@/types/course";

export const useCourseCreate = () => {
  const createCourse = async (data: CourseCreateData) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Authentication error:', userError);
        toast({
          title: "Authentication Error",
          description: "Please sign in to create a course.",
          variant: "destructive",
        });
        return false;
      }

      // Create a course object with all required fields
      const courseData = { 
        title: data.title,
        user_id: user.id,
        // Add optional fields only if they exist
        ...(data.description ? { description: data.description } : {}),
        ...(data.code ? { code: data.code } : {})
      };

      console.log('Creating course with data:', courseData);

      const { data: createdCourse, error: courseError } = await supabase
        .from('courses')
        .insert(courseData)
        .select('*')
        .single();

      if (courseError) {
        console.error('Course creation error:', courseError);
        
        // Provide more specific error messages based on error types
        if (courseError.code === '23505') {
          toast({
            title: "Duplicate Entry",
            description: "A course with this title already exists.",
            variant: "destructive",
          });
        } else if (courseError.code === '23503') {
          toast({
            title: "Reference Error",
            description: "There was an issue with user association.",
            variant: "destructive",
          });
        } else if (courseError.code === '23502') {
          toast({
            title: "Missing Required Fields",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create course. Please try again.",
            variant: "destructive",
          });
        }
        return false;
      }
      
      console.log('Course created successfully:', createdCourse);
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
