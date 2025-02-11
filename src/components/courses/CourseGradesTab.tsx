
import { Card, CardContent } from "@/components/ui/card";

interface Performance {
  average_score: number;
  completed_quizzes: number;
  total_quizzes: number;
}

interface CourseGradesTabProps {
  performance: Performance | null;
}

export const CourseGradesTab = ({ performance }: CourseGradesTabProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        {performance ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{performance.average_score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Quizzes</p>
                <p className="text-2xl font-bold">
                  {performance.completed_quizzes}/{performance.total_quizzes}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No grade information available yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
