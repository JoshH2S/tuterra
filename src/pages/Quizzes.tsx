
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCourses } from "@/hooks/useCourses";
import { useQuizzesFetch } from "@/hooks/useQuizzesFetch";
import { useQuizzesProcessor } from "@/hooks/useQuizzesProcessor";
import { useQuizzesFilter } from "@/hooks/useQuizzesFilter";
import { useQuizActions } from "@/hooks/useQuizActions";
import { QuizFilters } from "@/components/quizzes/QuizFilters";
import { CourseQuizSection } from "@/components/quizzes/CourseQuizSection";
import { QuizzesEmptyState } from "@/components/quizzes/QuizzesEmptyState";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";

export default function Quizzes() {
  const location = useLocation();
  const { courses } = useCourses();
  const isMobile = useIsMobile();
  
  const { quizzesByCourse, loading, fetchQuizzes } = useQuizzesFetch();
  const { processedCourses } = useQuizzesProcessor(courses, quizzesByCourse);
  const {
    searchTerm,
    setSearchTerm,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    filteredCourses,
    totalQuizCount
  } = useQuizzesFilter(processedCourses);
  
  const {
    confirmRetakeQuiz,
    setConfirmRetakeQuiz,
    handleViewResults,
    handleStartQuiz,
    handleRetakeQuiz,
    handleRetakeConfirm,
    handleCreateQuiz
  } = useQuizActions();

  useEffect(() => {
    fetchQuizzes();
  }, [location.key]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const showEmptyState = totalQuizCount === 0;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-8 w-full max-w-full">
      <QuizFilters
        searchTerm={searchTerm}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        courses={courses}
        setSearchTerm={setSearchTerm}
        setSelectedCourse={setSelectedCourse}
        setSelectedStatus={setSelectedStatus}
        handleCreateQuiz={handleCreateQuiz}
        refreshQuizzes={fetchQuizzes}
      />

      {showEmptyState && (
        <QuizzesEmptyState onCreateQuiz={handleCreateQuiz} />
      )}

      {!showEmptyState && (
        <div className="space-y-4 sm:space-y-8 w-full">
          {filteredCourses.map((course) => (
            <CourseQuizSection
              key={course.id}
              course={course}
              onViewResults={(quizId) => handleViewResults(quizId, quizzesByCourse)}
              onStartQuiz={handleStartQuiz}
              onRetakeQuiz={(quizId) => handleRetakeQuiz(quizId, quizzesByCourse)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 sm:mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <QuizDisclaimer />
      </div>

      {confirmRetakeQuiz && (
        <RetakeConfirmDialog
          open={!!confirmRetakeQuiz}
          onOpenChange={(open) => {
            if (!open) setConfirmRetakeQuiz(null);
          }}
          onConfirm={handleRetakeConfirm}
          quizTitle={confirmRetakeQuiz.title}
          previousScore={confirmRetakeQuiz.latest_response ? 
            confirmRetakeQuiz.latest_response.score : 
            undefined}
        />
      )}
    </div>
  );
}
