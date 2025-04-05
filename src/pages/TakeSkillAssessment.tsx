
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";
import { AssessmentHeader } from "@/components/skill-assessment/AssessmentHeader";
import { QuestionDisplay } from "@/components/skill-assessment/QuestionDisplay";
import { SubmissionControls } from "@/components/skill-assessment/SubmissionControls";
import { useSkillAssessmentTaking } from "@/hooks/useSkillAssessmentTaking";
import { MobileProgressBar } from "@/components/skill-assessment/MobileProgressBar";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile, useTouchDevice } from "@/hooks/use-mobile";

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTouch = useTouchDevice();
  
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
    handleSubmit
  } = useSkillAssessmentTaking(id);

  // Enhanced swipe handlers for mobile - with improved options
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isLastQuestion && goToNextQuestion(),
    onSwipedRight: () => currentQuestionIndex > 0 && goToPreviousQuestion(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    touchEventOptions: { passive: false },
    delta: 50, // Minimum swipe distance required
    swipeDuration: 500, // Maximum time in ms allowed for swipe
  });

  // Animation variants for question transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '30%' : '-30%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '30%' : '-30%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Determine swipe direction
  const getDirection = () => {
    return 1; // Default to right-to-left for new questions
  };

  if (loading) {
    return (
      <div className="container px-4 py-8 flex justify-center items-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container px-4 py-6 sm:py-8 w-full">
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Assessment not found</h2>
            <p className="text-sm mb-4">The assessment you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-hidden w-full">
      <AssessmentHeader 
        title={assessment.title}
        timeRemaining={timeRemaining}
        level={assessment.level}
      />

      {/* Mobile progress bar - visible only on mobile */}
      <div className={`${isMobile ? 'block' : 'hidden'} sticky top-0 z-10 bg-background pt-2 pb-3 -mx-4 px-4 border-b w-full`}>
        <MobileProgressBar 
          progress={progress} 
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="md:grid md:grid-cols-4 gap-4 sm:gap-6 w-full">
        {/* Left sidebar with progress - desktop only */}
        <div className="hidden md:block">
          <Card className="sticky top-24 w-full">
            <CardContent className="p-4">
              <AssessmentProgressTracker 
                sections={sections}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                timeRemaining={timeRemaining}
                totalTime={totalTime}
                hideTimer={true}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div 
          className="md:col-span-3 space-y-3 sm:space-y-4 md:space-y-6 touch-manipulation relative w-full"
          {...(isTouch ? swipeHandlers : {})}
        >
          <AnimatePresence initial={false} custom={getDirection()} mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestionIndex}
                custom={getDirection()}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
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
              
          <div className="pb-20 md:pb-0 w-full">
            <SubmissionControls
              isLastQuestion={isLastQuestion}
              currentQuestionIndex={currentQuestionIndex}
              isSubmitting={isSubmitting}
              submissionProgress={submissionProgress}
              onPrevious={goToPreviousQuestion}
              onNext={goToNextQuestion}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Swipe hint for mobile users - shown only initially */}
          {isMobile && isTouch && (
            <motion.div 
              className="fixed bottom-28 left-0 right-0 flex justify-center opacity-70 pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1, duration: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-background/80 backdrop-blur-sm text-xs text-center rounded-full px-4 py-2 shadow-sm">
                Swipe left/right to navigate questions
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
