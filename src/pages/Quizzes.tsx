
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { ScrollText, Plus } from "lucide-react";
import { useQuizzesFetch } from "@/hooks/useQuizzesFetch";
import { useQuizzesProcessor } from "@/hooks/useQuizzesProcessor";
import { useQuizzesFilter } from "@/hooks/useQuizzesFilter";
import { useQuizActions } from "@/hooks/useQuizActions";
import { QuizFilters } from "@/components/quizzes/QuizFilters";
import { CourseQuizSection } from "@/components/quizzes/CourseQuizSection";
import { QuizzesEmptyState } from "@/components/quizzes/QuizzesEmptyState";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";
import { CreateQuizTypeDialog } from "@/components/quizzes/CreateQuizTypeDialog";

export default function Quizzes() {
  const location = useLocation();
  const { courses } = useCourses();
  const isMobile = useIsMobile();
  
  const { quizzesByCourse, loading, fetchQuizzes } = useQuizzesFetch();
  const { processedCourses = [] } = useQuizzesProcessor(courses, quizzesByCourse);
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
    showCreateQuizDialog,
    setShowCreateQuizDialog,
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

  // Check if we have courses and quizzes
  const showEmptyState = !totalQuizCount || totalQuizCount === 0;

  return (
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white" />

      {/* Hero Card */}
      <div className="relative z-10 mb-16 px-4 sm:px-6">
        <div
          className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4"
          style={{ minHeight: '340px' }}
        >
          <div className="flex flex-col justify-between p-4 sm:w-[36%] shrink-0">
            <div>
              <p className="text-xs font-mono text-[#8a7a5a] mb-4 tracking-wide uppercase">Test Your Knowledge</p>
              <div className="flex items-start gap-3 mb-4">
                <ScrollText className="h-8 w-8 text-[#7a6a2a] mt-1 shrink-0" />
                <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">Quizzes</h1>
              </div>
              <p className="text-sm text-[#5a5040] leading-relaxed">Generate and take AI-powered quizzes to reinforce what you've learned across any topic.</p>
            </div>
            <div className="mt-8">
              <Button
                onClick={handleCreateQuiz}
                className="flex items-center gap-2 px-6 py-5 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition-all font-semibold"
              >
                <Plus className="h-5 w-5" />
                Create Quiz
              </Button>
            </div>
          </div>
          <div
            className="flex-1 rounded-xl bg-cover bg-center min-h-[200px] sm:min-h-0"
            style={{ backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/quizzes.jpg')" }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-10 relative z-10">
      <QuizFilters
        searchTerm={searchTerm}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        courses={courses || []}
        setSearchTerm={setSearchTerm}
        setSelectedCourse={setSelectedCourse}
        setSelectedStatus={setSelectedStatus}
        handleCreateQuiz={handleCreateQuiz}
        refreshQuizzes={fetchQuizzes}
      />

      {showEmptyState && (
        <QuizzesEmptyState onCreateQuiz={handleCreateQuiz} />
      )}

      {!showEmptyState && filteredCourses && filteredCourses.length > 0 && (
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
          onClose={() => setConfirmRetakeQuiz(null)}
          quizTitle={confirmRetakeQuiz.title}
          previousScore={confirmRetakeQuiz.latest_response ? 
            confirmRetakeQuiz.latest_response.score : 
            undefined}
        />
      )}
      
      <CreateQuizTypeDialog
        open={showCreateQuizDialog}
        onOpenChange={setShowCreateQuizDialog}
      />
    </div>
    </>
  );
}
