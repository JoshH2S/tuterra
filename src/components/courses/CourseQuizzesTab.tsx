
import { Card, CardContent } from "@/components/ui/card";

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
}

interface CourseQuizzesTabProps {
  quizzes: Quiz[];
}

export const CourseQuizzesTab = ({ quizzes }: CourseQuizzesTabProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
