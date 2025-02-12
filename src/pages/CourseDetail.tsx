
import { useParams } from "react-router-dom";
import { TutorChat } from "@/components/tutor/TutorChat";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CourseDetail = () => {
  const { courseId } = useParams();

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
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
