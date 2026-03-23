import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, WifiOff, Clock, ChevronLeft } from "lucide-react";
import { QuestionDisplay } from "@/components/skill-assessment/QuestionDisplay";
import { useSkillAssessmentTaking } from "@/hooks/useSkillAssessmentTaking";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { useTouchDevice } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isTouch = useTouchDevice();
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    assessment,
    loading,
    currentQuestionIndex,
    answers,
    timeRemaining,
    isSubmitting,
    error,
    submissionProgress,
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

  const slideVariants = {
    enter: { x: "25%", opacity: 0 },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: {
      x: "-25%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.15 },
      },
    },
  };

  const timerColor = useMemo(() => {
    if (timeRemaining <= 60) return "text-red-500 border-red-200 bg-red-50";
    if (timeRemaining <= 180) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-gray-600 border-gray-200 bg-gray-50";
  }, [timeRemaining]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [timeRemaining]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLoading();
      toast({ title: "Refreshed", description: "Assessment data refreshed." });
    } catch {
      toast({
        title: "Refresh failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (id && answers?.length > 0) {
      try {
        localStorage.setItem(
          `assessment_answers_${id}`,
          JSON.stringify({ answers, lastUpdated: new Date().toISOString(), currentQuestionIndex })
        );
      } catch {}
    }
  }, [id, answers, currentQuestionIndex]);

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8A84B] mx-auto" />
          <p className="text-sm text-gray-500">Loading assessment…</p>
        </div>
      </div>
    );
  }

  // --- Error / not found ---
  if ((error && !assessment) || !assessment) {
    const msg =
      error ||
      "The assessment you're looking for doesn't exist or you don't have access to it.";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {error ? "Error Loading Assessment" : "Assessment Not Found"}
          </h2>
          <p className="text-sm text-gray-500">{msg}</p>
          {isOfflineMode && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <WifiOff className="h-4 w-4" /> Offline — check your connection
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            {error && (
              <Button onClick={handleRetry} disabled={isRetrying} variant="outline" size="sm">
                {isRetrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                )}
                Retry
              </Button>
            )}
            <Button
              onClick={() => navigate("/skill-assessments")}
              size="sm"
              className="bg-[#091747] text-white rounded-full px-5 hover:bg-[#0d2060]"
            >
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-4">

          {/* Logo */}
          <div className="flex items-center justify-center mb-2">
            <img
              src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
              alt="tuterra.ai"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Banners */}
          {isOfflineMode && (
            <Alert className="bg-blue-50 border-blue-100 rounded-xl">
              <WifiOff className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-sm font-medium text-blue-700">Offline Mode</AlertTitle>
              <AlertDescription className="text-xs text-blue-600">
                Your progress is saved locally and will sync when you reconnect.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between text-sm">
                {error}
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-4 h-7"
                  onClick={handleRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Main card */}
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden"
            {...(isTouch ? swipeHandlers : {})}
          >
            {/* Card header: title + timer + level + progress */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Skill Assessment
                  </p>
                  <h1 className="text-base font-semibold text-gray-900 mt-0.5 truncate">
                    {assessment.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {assessment.level && (
                    <span className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 capitalize whitespace-nowrap">
                      {assessment.level}
                    </span>
                  )}
                  <div
                    className={`flex items-center px-2.5 py-1.5 rounded-full border text-xs font-medium ${timerColor}`}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {formattedTime}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#C8A84B] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>

            {/* Animated question area */}
            <AnimatePresence initial={false} mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestionIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <QuestionDisplay
                    question={currentQuestion}
                    currentAnswer={answers[currentQuestionIndex]}
                    onAnswerChange={handleAnswerChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-50">
              {isSubmitting && (
                <div className="mb-4">
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#C8A84B] rounded-full"
                      animate={{ width: `${submissionProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-1.5">
                    Submitting assessment…
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  className="text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={isLastQuestion ? handleSubmit : goToNextQuestion}
                  disabled={isSubmitting}
                  className="rounded-full px-6 bg-[#091747] hover:bg-[#0d2060] text-white text-sm font-medium h-9"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Submitting…
                    </>
                  ) : isLastQuestion ? (
                    "Submit Assessment"
                  ) : (
                    "Next Question →"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Swipe hint on touch devices */}
          {isTouch && (
            <motion.p
              className="text-center text-xs text-gray-400 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Swipe left or right to navigate
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
