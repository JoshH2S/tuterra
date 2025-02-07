
import { StudentCourse, StudentPerformance } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, Clock } from "lucide-react";
import { format } from "date-fns";

interface CourseCardProps {
  course: StudentCourse;
  performance: StudentPerformance | undefined;
}

export const CourseCard = ({ course, performance }: CourseCardProps) => {
  const completionRate = performance 
    ? (performance.completed_quizzes / performance.total_quizzes) * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{course.course.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          Last accessed {format(new Date(course.last_accessed), 'MMM d, yyyy')}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {performance && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{completionRate.toFixed(0)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {performance.average_score.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                <p className="text-2xl font-bold">
                  {performance.completed_quizzes}/{performance.total_quizzes}
                </p>
              </div>
            </div>
          </>
        )}
        {!performance && (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Book className="mr-2 h-5 w-5" />
            <span>No quizzes taken yet</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
