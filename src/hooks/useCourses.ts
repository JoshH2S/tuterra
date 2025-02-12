
import { useCourseFetch } from "./useCourseFetch";
import { useCourseCreate } from "./useCourseCreate";
import { useCourseFileUpload } from "./useCourseFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useCourses = () => {
  const { courses, isLoading, error, setCourses } = useCourseFetch();
  const { createCourse } = useCourseCreate(setCourses);
  const { handleFileUpload } = useCourseFileUpload();

  const deleteCourse = async (courseId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (deleteError) throw deleteError;

      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    courses,
    isLoading,
    error,
    createCourse,
    handleFileUpload,
    deleteCourse
  };
};
