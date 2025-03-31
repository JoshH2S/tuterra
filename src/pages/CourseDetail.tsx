
import { useParams, useNavigate } from "react-router-dom";
import { TutorChat } from "@/components/tutor/TutorChat";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_materials (
            id,
            file_name,
            content
          )
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const handleBack = () => {
    navigate('/courses');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-4 pl-2 flex items-center touch-manipulation"
          size="sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Button>
        
        {course && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {course.description || "No description available"}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <TutorChat />
      </div>
    </div>
  );
};

export default CourseDetail;
