
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

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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

  // Setup swipe handlers for mobile - fixed to use proper options
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isLastQuestion && goToNextQuestion(),
    onSwipedRight: () => currentQuestionIndex > 0 && goToPreviousQuestion(),
    touchEventOptions: { passive: false },
    trackMouse: false
  });

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Assessment not found</h2>
            <p className="mb-4">The assessment you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6 space-y-4 md:space-y-6">
      <AssessmentHeader 
        title={assessment.title}
        timeRemaining={timeRemaining}
        level={assessment.level}
      />

      {/* Mobile progress bar - visible only on mobile */}
      <div className="md:hidden">
        <MobileProgressBar 
          progress={progress} 
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="md:grid md:grid-cols-4 gap-6">
        {/* Left sidebar with progress - desktop only */}
        <div className="hidden md:block">
          <Card>
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
          className="md:col-span-3 space-y-4 md:space-y-6 touch-manipulation"
          {...swipeHandlers}
        >
          {currentQuestion && (
            <>
              <QuestionDisplay
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                currentAnswer={answers[currentQuestionIndex]}
                onAnswerChange={handleAnswerChange}
                progress={progress}
              />
              
              <SubmissionControls
                isLastQuestion={isLastQuestion}
                currentQuestionIndex={currentQuestionIndex}
                isSubmitting={isSubmitting}
                submissionProgress={submissionProgress}
                onPrevious={goToPreviousQuestion}
                onNext={goToNextQuestion}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
