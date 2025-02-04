import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";
import { processFileContent } from "@/utils/file-utils";
import { RefreshCw, CheckCircle } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const { toast } = useToast();

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
      return;
    }

    setCourses(data || []);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleRefresh = () => {
    fetchCourses();
    toast({
      title: "Refreshed",
      description: "Course list has been updated",
    });
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
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Courses
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                {course.title}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;