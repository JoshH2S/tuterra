
import { Card } from "@/components/ui/card";
import { StudentPerformance } from "@/types/student";

interface StatsCardsProps {
  performance: StudentPerformance[];
}

export function StatsCards({ performance }: StatsCardsProps) {
  // Calculate the weighted average score based on completed quizzes
  const totalCompletedQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const averageScore = totalCompletedQuizzes > 0
    ? performance.reduce((acc, curr) => acc + (curr.average_score * curr.completed_quizzes), 0) / totalCompletedQuizzes
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const totalCompletionRate = performance.length > 0
    ? (performance.reduce((acc, curr) => acc + ((curr.completed_quizzes / curr.total_quizzes) * 100), 0) / performance.length)
    : 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Overall Average</p>
          <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
        </div>
      </Card>
      <Card className="p-4 border-l-4 border-l-green-500">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Quizzes Completed</p>
          <p className="text-2xl font-bold">{totalQuizzes}</p>
        </div>
      </Card>
      <Card className="p-4 border-l-4 border-l-purple-500">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-bold">{totalCompletionRate.toFixed(1)}%</p>
        </div>
      </Card>
    </section>
  );
}
