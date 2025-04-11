
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CourseGrade {
  total_quizzes: number;
  average_grade: number;
}

interface GradeSummaryCardProps {
  courseGrade: CourseGrade;
}

export function GradeSummaryCard({ courseGrade }: GradeSummaryCardProps) {
  return (
    <Card className="bg-primary/5 w-full">
      <CardHeader>
        <CardTitle>Course Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
            <p className="text-xl sm:text-2xl font-bold">{courseGrade.total_quizzes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course Average</p>
            <p className="text-xl sm:text-2xl font-bold">
              {courseGrade.average_grade.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
