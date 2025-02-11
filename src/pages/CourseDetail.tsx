
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTutorMaterials } from "@/hooks/useTutorMaterials";
import { FileText, GraduationCap, ListChecks, PenTool } from "lucide-react";
import { CourseStateCard } from "@/components/courses/CourseStateCard";
import { CourseMaterialsTab } from "@/components/courses/CourseMaterialsTab";
import { CourseAssignmentsTab } from "@/components/courses/CourseAssignmentsTab";
import { CourseQuizzesTab } from "@/components/courses/CourseQuizzesTab";
import { CourseGradesTab } from "@/components/courses/CourseGradesTab";

const CourseDetail = () => {
  const { courseId } = useParams();
  console.log("CourseId from params:", courseId);
  
  const { materials } = useTutorMaterials(courseId || '');

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('No course ID provided');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Course not found');
      
      console.log("Course data:", data);
      return data;
    },
    enabled: !!courseId,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      console.log("Assignments data:", data);
      return data || [];
    },
    enabled: !!courseId,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Quizzes data:", data);
      return data || [];
    },
    enabled: !!courseId,
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['performance', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('student_performance')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      console.log("Performance data:", data);
      return data;
    },
    enabled: !!courseId,
  });

  if (courseLoading || assignmentsLoading || quizzesLoading || performanceLoading) {
    return <CourseStateCard message="Loading course details..." />;
  }

  if (courseError) {
    return <CourseStateCard message={`Error loading course: ${courseError.message}`} isError />;
  }

  if (!course) {
    return <CourseStateCard message="Course not found" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
            {course.description && (
              <p className="text-gray-600">{course.description}</p>
            )}
          </CardHeader>
        </Card>

        <Tabs defaultValue="materials" className="space-y-4">
          <TabsList>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Course Materials
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Course Grade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <CourseMaterialsTab materials={materials} />
          </TabsContent>

          <TabsContent value="assignments">
            <CourseAssignmentsTab assignments={assignments || []} />
          </TabsContent>

          <TabsContent value="quizzes">
            <CourseQuizzesTab quizzes={quizzes || []} />
          </TabsContent>

          <TabsContent value="grades">
            <CourseGradesTab performance={performance} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;
