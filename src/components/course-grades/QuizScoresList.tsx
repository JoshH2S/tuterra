
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface QuizScore {
  id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  taken_at: string;
  quiz: {
    title: string;
  };
}

interface QuizScoresListProps {
  quizScores: QuizScore[];
}

export function QuizScoresList({ quizScores }: QuizScoresListProps) {
  if (quizScores.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center text-muted-foreground">
          No quizzes taken yet
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {quizScores.map((score) => (
        <QuizScoreCard key={score.id} score={score} />
      ))}
    </>
  );
}

function QuizScoreCard({ score }: { score: QuizScore }) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow w-full touch-manipulation"
    >
      <CardContent className="py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <div>
            <h3 className="font-medium">{score.quiz.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Taken on {format(new Date(score.taken_at), 'PPP')}
            </p>
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0">
            <p className="text-xl sm:text-2xl font-bold">
              {((score.score / score.max_score) * 100).toFixed(1)}%
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {score.score} / {score.max_score} points
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
