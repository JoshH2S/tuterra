
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StudentPerformance } from "@/types/student";

interface GradeSummaryCardProps {
  performance: StudentPerformance | null;
}

export function GradeSummaryCard({ performance }: GradeSummaryCardProps) {
  if (!performance) {
    return (
      <Card className="bg-primary/5 w-full">
        <CardHeader>
          <CardTitle>Course Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
              <p className="text-xl sm:text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course Average</p>
              <p className="text-xl sm:text-2xl font-bold">0.0%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 w-full">
      <CardHeader>
        <CardTitle>Course Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Total Quizzes Taken</p>
            <p className="text-xl sm:text-2xl font-bold">{performance.completed_quizzes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Course Average</p>
            <p className="text-xl sm:text-2xl font-bold">
              {typeof performance.average_score === 'number' 
                ? performance.average_score.toFixed(1) 
                : Number(performance.average_score).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
