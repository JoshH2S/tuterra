
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCourseCreate = () => {
  const createCourse = async (title: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error: courseError } = await supabase
        .from('courses')
        .insert([{ 
          title,
          user_id: user.id
        }]);

      if (courseError) throw courseError;
      
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
