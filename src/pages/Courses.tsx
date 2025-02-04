import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { processFileContent, MAX_CONTENT_LENGTH } from "@/utils/file-utils";
import { Course } from "@/types/course";
import { CourseList } from "@/components/courses/CourseList";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

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
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!newCourseTitle.trim()) {
        toast({
          title: "Course title required",
          description: "Please enter a title for your course.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([
          { 
            title: newCourseTitle,
            teacher_id: user.id
          }
        ])
        .select()
        .single();

      if (courseError) throw courseError;

      setCourses(prev => [...prev, courseData]);
      setNewCourseTitle("");
      setIsCreatingCourse(false);
      
      toast({
        title: "Course created",
        description: `${newCourseTitle} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (file: File, courseId: string) => {
    try {
      const { content, wasContentTrimmed, originalLength } = await processFileContent(file);
      
      if (wasContentTrimmed) {
        toast({
          title: "Content trimmed",
          description: `File content has been trimmed from ${originalLength} to ${MAX_CONTENT_LENGTH} characters.`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Create and manage your courses</p>
        </div>
        <Button onClick={() => setIsCreatingCourse(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </div>

      {isCreatingCourse && (
        <CreateCourseForm
          newCourseTitle={newCourseTitle}
          onTitleChange={setNewCourseTitle}
          onSubmit={handleCreateCourse}
          onCancel={() => {
            setIsCreatingCourse(false);
            setNewCourseTitle("");
          }}
        />
      )}

      <CourseList 
        courses={courses}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
};

export default Courses;