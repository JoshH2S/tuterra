
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/course";
import { useCourses } from "@/hooks/useCourses";

interface Quiz {
  id: string;
  title: string;
  course_id: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface QuizzesByCourse {
  [courseId: string]: Quiz[];
}

export default function Quizzes() {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const navigate = useNavigate();
  const { courses } = useCourses();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            profiles:teacher_id (
              first_name,
              last_name
            )
          `)
          .eq('published', true);

        if (error) throw error;

        const quizzesByCourseTmp: QuizzesByCourse = {};
        data.forEach((quiz: Quiz) => {
          if (!quizzesByCourseTmp[quiz.course_id]) {
            quizzesByCourseTmp[quiz.course_id] = [];
          }
          quizzesByCourseTmp[quiz.course_id].push(quiz);
        });
        setQuizzesByCourse(quizzesByCourseTmp);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast({
          title: "Error",
          description: "Failed to load quizzes",
          variant: "destructive",
        });
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Available Quizzes</h1>
      </div>
      
      {courses.map((course) => {
        const courseQuizzes = quizzesByCourse[course.id] || [];
        if (courseQuizzes.length === 0) return null;

        return (
          <div key={course.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courseQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Teacher: {quiz.profiles.first_name} {quiz.profiles.last_name}
                    </p>
                    <Button onClick={() => navigate(`/take-quiz/${quiz.id}`)}>
                      Take Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
