import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";
import { processFileContent } from "@/utils/file-utils";

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      if (!courseName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a course name",
          variant: "destructive",
        });
        return;
      }

      // Process and sanitize file content
      const { content, wasContentTrimmed } = await processFileContent(file);

      // First create the course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert([
          {
            title: courseName,
            teacher_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (courseError) throw courseError;

      // Then upload the course material with sanitized content
      const { data: materialData, error: materialError } = await supabase
        .from("course_materials")
        .insert([
          {
            course_id: courseData.id,
            file_name: file.name,
            file_type: file.type,
            content: content,
          },
        ])
        .select()
        .single();

      if (materialError) throw materialError;

      // Update local state
      setCourses((prev) => [...prev, courseData as Course]);
      setCourseName("");

      if (wasContentTrimmed) {
        toast({
          title: "Success with modifications",
          description: `Course "${courseName}" created. Note: Some special characters were removed from the file content for compatibility.`,
        });
      } else {
        toast({
          title: "Success",
          description: `Course "${courseName}" created with uploaded material`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create course and upload material",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Course Material</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <FileUpload onFileSelect={handleFileUpload} />
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;