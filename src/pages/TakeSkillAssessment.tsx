import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";
import { AssessmentHeader } from "@/components/skill-assessment/AssessmentHeader";
import { QuestionDisplay } from "@/components/skill-assessment/QuestionDisplay";
import { SubmissionControls } from "@/components/skill-assessment/SubmissionControls";
import { useSkillAssessmentTaking } from "@/hooks/useSkillAssessmentTaking";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile, useTouchDevice } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "30%" : "-30%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "30%" : "-30%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTouch = useTouchDevice();
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    assessment,
    loading,
    currentQuestionIndex,
    answers,
    timeRemaining,
    totalTime,
    isSubmitting,
    error,
    submissionProgress,
    sections,
    progress,
    isLastQuestion,
    currentQuestion,
    totalQuestions,
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion,
    handleSubmit,
    retry: retryLoading,
    isOfflineMode,
  } = useSkillAssessmentTaking(id);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isLastQuestion && goToNextQuestion(),
    onSwipedRight: () => currentQuestionIndex > 0 && goToPreviousQuestion(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
    delta: 50,
    swipeDuration: 500,
  });

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLoading();
      toast({ title: "Refreshed", description: "Assessment data has been refreshed successfully." });
    } catch {
      toast({ title: "Refresh failed", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (id && answers && answers.length > 0) {
      try {
        localStorage.setItem(`assessment_answers_${id}`, JSON.stringify({
          answers,
          lastUpdated: new Date().toISOString(),
          currentQuestionIndex,
        }));
      } catch (e) {
        console.error("Error saving answers to localStorage:", e);
      }
    }
  }, [id, answers, currentQuestionIndex]);

  const PageShell = ({ children }: { children: React.ReactNode }) => (
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-background" />
      <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 w-full">
          <img
            src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
            alt="tuterra.ai"
            className="h-10 w-auto object-contain"
          />
        </div>
        {children}
      </div>
    </>
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#C8A84B]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#C8A84B] border-l-transparent border-r-transparent border-b-transparent animate-spin" />
          </div>
          <p className="text-base font-medium text-gray-700">Loading assessment…</p>
        </div>
      </PageShell>
    );
  }

  if (error && !assessment) {
    return (
      <PageShell>
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Assessment</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {isOfflineMode && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <WifiOff className="h-4 w-4" />
              <span>You appear to be offline. Please check your connection.</span>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Retrying…</> : <><RefreshCw className="h-4 w-4 mr-2" />Retry</>}
            </Button>
            <Button onClick={() => navigate("/skill-assessments")} variant="outline">
              Back to Assessments
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!assessment) {
    return (
      <PageShell>
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <h2 className="text-xl font-medium text-gray-900">Assessment not found</h2>
          <p className="text-sm text-gray-500">The assessment you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate("/skill-assessments")}>Back to Assessments</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full max-w-3xl space-y-4">
        {/* Assessment header: title + timer */}
        <AssessmentHeader
          title={assessment.title}
          timeRemaining={timeRemaining}
          level={assessment.level}
        />

        {isOfflineMode && (
          <Alert className="bg-blue-50 border-blue-200">
            <WifiOff className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">Offline Mode</AlertTitle>
            <AlertDescription className="text-blue-600 text-sm">
              Your progress is saved locally and will sync when you reconnect.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" variant="destructive" className="h-8 ml-4" onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                <span className="ml-1">Retry</span>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Layout: sidebar (desktop) + question */}
        <div className="md:grid md:grid-cols-4 gap-4">
          {/* Sidebar - desktop only */}
          <div className="hidden md:block">
            <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-4">
              <AssessmentProgressTracker
                sections={sections}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                timeRemaining={timeRemaining}
                totalTime={totalTime}
                hideTimer={true}
              />
            </div>
          </div>

          {/* Main question area */}
          <div
            className="md:col-span-3 space-y-3 touch-manipulation"
            {...(isTouch ? swipeHandlers : {})}
          >
            <AnimatePresence initial={false} custom={1} mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestionIndex}
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <QuestionDisplay
                    question={currentQuestion}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={totalQuestions}
                    currentAnswer={answers[currentQuestionIndex]}
                    onAnswerChange={handleAnswerChange}
                    progress={progress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pb-20 md:pb-0">
              <SubmissionControls
                isLastQuestion={isLastQuestion}
                currentQuestionIndex={currentQuestionIndex}
                isSubmitting={isSubmitting}
                submissionProgress={submissionProgress}
                onPrevious={goToPreviousQuestion}
                onNext={goToNextQuestion}
                onSubmit={handleSubmit}
                isOfflineMode={isOfflineMode}
              />
            </div>

            {isMobile && isTouch && (
              <motion.div
                className="fixed bottom-28 left-0 right-0 flex justify-center pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="bg-background/80 backdrop-blur-sm text-xs text-center rounded-full px-4 py-2 shadow-sm text-gray-500">
                  Swipe left / right to navigate
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
