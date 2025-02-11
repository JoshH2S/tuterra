
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTutorMaterials } from "@/hooks/useTutorMaterials";
import { FileText, GraduationCap, ListChecks, PenTool } from "lucide-react";
import { format } from "date-fns";

const CourseDetail = () => {
  const { courseId } = useParams();
  console.log("CourseId from params:", courseId); // Debug log
  
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
      
      console.log("Course data:", data); // Debug log
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
      console.log("Assignments data:", data); // Debug log
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
      console.log("Quizzes data:", data); // Debug log
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
      console.log("Performance data:", data); // Debug log
      return data;
    },
    enabled: !!courseId,
  });

  if (courseLoading || assignmentsLoading || quizzesLoading || performanceLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Loading course details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error loading course: {courseError.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Course not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {course && (
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

            <TabsContent value="materials" className="space-y-4">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{material.file_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {assignments?.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Points: {assignment.max_points}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              {quizzes?.map((quiz) => (
                <Card key={quiz.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        Duration: {quiz.duration_minutes} minutes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  {performance ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="text-2xl font-bold">{performance.average_score}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed Quizzes</p>
                          <p className="text-2xl font-bold">
                            {performance.completed_quizzes}/{performance.total_quizzes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No grade information available yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
