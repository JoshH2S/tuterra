
import { useParams, useNavigate } from "react-router-dom";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { CourseGradesHeader } from "@/components/course-grades/CourseGradesHeader";
import { GradeSummaryCard } from "@/components/course-grades/GradeSummaryCard";
import { QuizScoresList } from "@/components/course-grades/QuizScoresList";
import { useQuizScores } from "@/hooks/useQuizScores";

export default function CourseGrades() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { quizScores, courseGrade, isLoading, courseName } = useQuizScores(courseId);

  const handleBack = () => {
    navigate('/courses');
  };

  if (isLoading) {
    return <AdaptiveLoading />;
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 space-y-4 sm:space-y-6 px-4 w-full max-w-full">
      <CourseGradesHeader 
        courseName={courseName} 
        onBack={handleBack} 
      />
      
      <GradeSummaryCard courseGrade={courseGrade} />

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Quiz History</h2>
        <QuizScoresList quizScores={quizScores} />
      </div>
    </div>
  );
}
