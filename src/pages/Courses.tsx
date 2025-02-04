import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/use-toast";
import { PlusCircle, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "../components/FileUpload";
import { processFileContent } from "@/utils/file-utils";

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

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

      setCourses([...courses, { id: courseData.id, title: courseData.title }]);
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
      const { content: trimmedContent, wasContentTrimmed } = await processFileContent(file);
      
      if (wasContentTrimmed) {
        toast({
          title: "Content trimmed",
          description: `File content has been trimmed to the maximum allowed length.`,
          variant: "destructive",
        });
      }

      const { data: materialData, error: materialError } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_type: file.type,
            content: trimmedContent
          }
        ])
        .select()
        .single();

      if (materialError) throw materialError;
      
      toast({
        title: "Material uploaded",
        description: `${file.name} has been successfully uploaded.`,
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Enter course title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateCourse}>
              Create Course
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreatingCourse(false);
                setNewCourseTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No courses created yet</p>
            <p className="text-sm">Create your first course to get started</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
              <FileUpload 
                onFileSelect={(file) => handleFileSelect(file, course.id)}
                acceptedTypes=".pdf,.doc,.docx,.txt"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/lesson-planning')}>
                  Create Lesson Plan
                </Button>
                <Button variant="outline" size="sm">
                  View Materials
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;