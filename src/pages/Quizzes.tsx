
import { useState, useMemo } from "react";
import { useQuizzesFetch } from "@/hooks/useQuizzesFetch";
import { useQuizzesFilter } from "@/hooks/useQuizzesFilter";
import { useQuizzesProcessor } from "@/hooks/useQuizzesProcessor";
import { useQuizActions } from "@/hooks/useQuizActions";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { CourseQuizSection } from "@/components/quizzes/CourseQuizSection";
import { QuizzesEmptyState } from "@/components/quizzes/QuizzesEmptyState";
import { QuizFilters } from "@/components/quizzes/QuizFilters";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";
import { ProcessedQuiz } from "@/types/quiz-display";

export default function Quizzes() {
  const { quizzes, isLoading, error, refetchQuizzes } = useQuizzesFetch();
  const { filterOptions, selectedFilters, updateFilter } = useQuizzesFilter();
  const { processedCourses, quizzesByCourse } = useQuizzesProcessor(quizzes);
  const {
    confirmRetakeQuiz,
    setConfirmRetakeQuiz,
    handleViewResults,
    handleStartQuiz,
    handleRetakeQuiz,
    handleRetakeConfirm,
    handleCreateQuiz,
    hasQuizProgress
  } = useQuizActions();

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    if (!selectedFilters.status.length && !selectedFilters.course.length) {
      return processedCourses;
    }

    return processedCourses.reduce((result, course) => {
      // Filter quizzes based on status and course filters
      const filteredQuizzes = course.quizzes.filter(quiz => {
        const statusMatch = selectedFilters.status.length === 0 || 
          selectedFilters.status.includes(quiz.status) ||
          (hasQuizProgress(quiz.id) && selectedFilters.status.includes('in_progress'));
        
        const courseMatch = selectedFilters.course.length === 0 || 
          selectedFilters.course.includes(course.id);
        
        return statusMatch && courseMatch;
      });

      // Only include courses that have matching quizzes
      if (filteredQuizzes.length > 0) {
        result.push({
          ...course,
          quizzes: filteredQuizzes
        });
      }

      return result;
    }, [] as typeof processedCourses);
  }, [processedCourses, selectedFilters, hasQuizProgress]);

  if (isLoading) {
    return <AdaptiveLoading />;
  }

  if (error) {
    return <div className="container py-12">Error loading quizzes: {error.message}</div>;
  }

  if (!processedCourses.length) {
    return <QuizzesEmptyState onCreateQuiz={handleCreateQuiz} />;
  }

  const handleViewResultsForQuiz = (quizId: string) => {
    handleViewResults(quizId, quizzesByCourse);
  };

  const handleRetakeForQuiz = (quizId: string) => {
    handleRetakeQuiz(quizId, quizzesByCourse);
  };

  return (
    <div className="container mx-auto max-w-screen-xl py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <QuizFilters 
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={updateFilter}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No quizzes match your filters.</p>
          <button
            onClick={() => updateFilter('status', [])}
            className="text-primary underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        filteredCourses.map(course => (
          <CourseQuizSection
            key={course.id}
            courseTitle={course.title}
            quizzes={course.quizzes}
            onViewResults={handleViewResultsForQuiz}
            onStartQuiz={handleStartQuiz}
            onRetakeQuiz={handleRetakeForQuiz}
            hasQuizProgress={hasQuizProgress}
          />
        ))
      )}

      <RetakeConfirmDialog
        open={!!confirmRetakeQuiz}
        onClose={() => setConfirmRetakeQuiz(null)}
        onConfirm={handleRetakeConfirm}
        quizTitle={confirmRetakeQuiz?.title || ""}
      />
    </div>
  );
}
