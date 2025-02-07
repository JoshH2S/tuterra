
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const navigate = useNavigate();

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
        setQuizzes(data);
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Available Quizzes</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
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
}
