
import { useParams, useNavigate } from "react-router-dom";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { CourseGradesHeader } from "@/components/course-grades/CourseGradesHeader";
import { GradeSummaryCard } from "@/components/course-grades/GradeSummaryCard";
import { QuizHistoryList } from "@/components/course-grades/QuizHistoryList";
import { useCourseQuizHistory } from "@/hooks/useCourseQuizHistory";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseGrades() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { quizHistory, isLoading, courseName, performance } = useCourseQuizHistory(courseId);

  const handleBack = () => navigate('/courses');

  if (isLoading) {
    return <AdaptiveLoading />;
  }

  const hasQuizHistory = quizHistory.length > 0;
  const hasPerformanceData = performance !== null;

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-4 sm:space-y-6 px-4 w-full max-w-full">
      <CourseGradesHeader 
        courseName={courseName} 
        onBack={handleBack} 
      />
      
      <GradeSummaryCard performance={performance} />

      {(hasPerformanceData || hasQuizHistory) && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Quiz History</h2>
          <QuizHistoryList quizScores={quizHistory} />
        </div>
      )}

      {!hasQuizHistory && !hasPerformanceData && (
        <Card className="w-full">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No quiz data available for this course yet.</p>
            <p className="text-muted-foreground mt-2">Complete some quizzes to see your performance here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
