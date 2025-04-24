
import { useParams, useNavigate } from "react-router-dom";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { CourseGradesHeader } from "@/components/course-grades/CourseGradesHeader";
import { GradeSummaryCard } from "@/components/course-grades/GradeSummaryCard";
import { QuizScoresList } from "@/components/course-grades/QuizScoresList";
import { useQuizScores } from "@/hooks/useQuizScores";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseGrades() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { performance, quizScores, isLoading, courseName } = useQuizScores(courseId);

  const handleBack = () => {
    navigate('/courses');
  };

  if (isLoading) {
    return <AdaptiveLoading />;
  }

  const hasPerformanceData = performance !== null && performance.completed_quizzes > 0;
  const hasQuizScores = quizScores.length > 0;

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-4 sm:space-y-6 px-4 w-full max-w-full">
      <CourseGradesHeader 
        courseName={courseName} 
        onBack={handleBack} 
      />
      
      <GradeSummaryCard performance={performance} />

      {!hasPerformanceData && !hasQuizScores && (
        <Card className="w-full">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No quiz data available for this course yet.</p>
            <p className="text-muted-foreground mt-2">Complete some quizzes to see your performance here.</p>
          </CardContent>
        </Card>
      )}

      {(hasPerformanceData || hasQuizScores) && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Quiz History</h2>
          <QuizScoresList quizScores={quizScores} />
        </div>
      )}
    </div>
  );
}
