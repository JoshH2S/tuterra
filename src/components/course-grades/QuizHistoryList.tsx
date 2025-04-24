
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizHistoryItem } from "@/hooks/useCourseQuizHistory";

interface QuizHistoryListProps {
  quizHistory: QuizHistoryItem[];
}

export function QuizHistoryList({ quizHistory }: QuizHistoryListProps) {
  if (!quizHistory || quizHistory.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center text-muted-foreground">
          You haven't taken any quizzes for this course yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizHistory.map((item) => (
        <QuizHistoryCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function QuizHistoryCard({ item }: { item: QuizHistoryItem }) {
  return (
    <Card className="hover:shadow-md transition-shadow w-full touch-manipulation">
      <CardContent className="py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Taken on {format(new Date(item.takenAt), 'PPP')}
            </p>
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0">
            <p className="text-xl sm:text-2xl font-bold">
              {item.scorePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
