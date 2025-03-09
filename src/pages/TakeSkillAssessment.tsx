
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
    <div className="container py-6 space-y-6">
      <AssessmentHeader 
        title={assessment.title}
        timeRemaining={timeRemaining}
        level={assessment.level}
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="md:grid md:grid-cols-4 gap-6">
        {/* Left sidebar with progress */}
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
        <div className="md:col-span-3 space-y-6">
          {currentQuestion && (
            <>
              <QuestionDisplay
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                currentAnswer={answers[currentQuestionIndex]}
                onAnswerChange={handleAnswerChange}
                progress={progress}
                isMobile={true}
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
