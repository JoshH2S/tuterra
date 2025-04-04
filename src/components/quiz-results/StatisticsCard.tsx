
import { Card, CardContent } from "@/components/ui/card";

interface StatisticsCardProps {
  correctAnswers: number;
  totalQuestions: number;
}

export function StatisticsCard({ correctAnswers, totalQuestions }: StatisticsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-1 text-gradient-blue">
              {correctAnswers}
            </h3>
            <p className="text-muted-foreground">
              Correct Answers
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1 text-gradient-blue">
              {totalQuestions}
            </h3>
            <p className="text-muted-foreground">
              Total Questions
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1 text-gradient-blue">
              {totalQuestions - correctAnswers}
            </h3>
            <p className="text-muted-foreground">
              Incorrect Answers
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
