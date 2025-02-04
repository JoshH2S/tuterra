import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";
import { processFileContent } from "@/utils/file-utils";
import { Course } from "@/types/course";
import { Loader2, FileText, Book, TestTube } from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;

      const { data: materialsData, error: materialsError } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (materialsError) throw materialsError;

      setCourse(courseData);
      setMaterials(materialsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const { content } = await processFileContent(file);

      const { error: materialError } = await supabase
        .from("course_materials")
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_type: file.type,
            content: content,
          },
        ]);

      if (materialError) throw materialError;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });

      fetchCourseDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p>Course not found</p>
        <Button onClick={() => navigate("/courses")} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600">Manage your course materials and generate content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Material</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={handleFileUpload} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate(`/lesson-planning?courseId=${courseId}`)}
                className="w-full flex items-center gap-2"
              >
                <Book className="h-4 w-4" />
                Generate Lesson Plan
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Quiz generation feature will be available soon!",
                })}
              >
                <TestTube className="h-4 w-4" />
                Generate Quiz
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No materials uploaded yet</p>
              ) : (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span>{material.file_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/lesson-planning?courseId=${courseId}&materialId=${material.id}`)}
                      >
                        Use for Lesson Plan
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;