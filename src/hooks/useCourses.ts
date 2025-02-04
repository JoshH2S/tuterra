import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";
import { processFileContent } from "@/utils/file-utils";

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);

      if (error) throw error;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      setCourses(prev => [...prev, courseData]);
      
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

  const handleFileUpload = async (file: File, courseId: string) => {
    try {
      const { content, wasContentTrimmed, originalLength } = await processFileContent(file);
      
      if (wasContentTrimmed) {
        toast({
          title: "Content trimmed",
          description: `File content has been trimmed from ${originalLength} characters.`,
          variant: "destructive",
        });
      }

      const { error: uploadError } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_type: file.type,
            content: content
          }
        ]);

      if (uploadError) throw uploadError;
      
      toast({
        title: "Success",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: "Error",
        description: "Failed to upload material. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    createCourse,
    handleFileUpload
  };
};