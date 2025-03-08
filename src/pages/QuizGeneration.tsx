import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { CourseSelectionStep } from "@/components/quiz-generation/steps/CourseSelectionStep";
import { MaterialUploadStep } from "@/components/quiz-generation/steps/MaterialUploadStep";
import { TopicsStep } from "@/components/quiz-generation/steps/TopicsStep";
import { PreviewStep } from "@/components/quiz-generation/steps/PreviewStep";
import { StepIndicator } from "@/components/quiz-generation/StepIndicator";
import { StepContainer } from "@/components/quiz-generation/StepContainer";
import { QuizNavigationButtons } from "@/components/quiz-generation/QuizNavigationButtons";
import { QuizActionsFooter } from "@/components/quiz-generation/QuizActionsFooter";
import { QuizNavigationLinks } from "@/components/quiz-generation/QuizNavigationLinks";
import { useQuizGeneration } from "@/hooks/quiz/useQuizGeneration";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";

const QuizGeneration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const {
    title,
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    quizId,
    contentLength,
    duration,
    selectedCourseId,
    difficulty,
    setTitle,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  } = useQuizGeneration();

  const { createTemplate } = useCourseTemplates();

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prevStep => prevStep + 1);
    } else if (currentStep === totalSteps) {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return !!selectedCourseId && !!title;
      case 2:
        return !!selectedFile;
      case 3:
        return topics.every(topic => !!topic.description);
      case 4:
        return !isProcessing;
      default:
        return true;
    }
  };

  const handleSaveTemplate = async () => {
    if (quizQuestions.length > 0) {
      await createTemplate(
        title || `Quiz Template - ${topics.map(t => t.description).join(", ")}`,
        {
          type: "quiz",
          topics,
          questions: quizQuestions,
          duration,
          difficulty
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <QuizGenerationHeader onSaveTemplate={quizQuestions.length > 0 ? handleSaveTemplate : undefined} />
            <div className="hidden md:block">
              <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <QuizNavigationLinks />
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepContainer key="course-selection">
                <CourseSelectionStep
                  title={title}
                  setTitle={setTitle}
                  selectedCourseId={selectedCourseId}
                  setSelectedCourseId={setSelectedCourseId}
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                />
              </StepContainer>
            )}

            {currentStep === 2 && (
              <StepContainer key="material-upload">
                <MaterialUploadStep
                  selectedFile={selectedFile}
                  handleFileSelect={handleFileSelect}
                  contentLength={contentLength}
                />
              </StepContainer>
            )}

            {currentStep === 3 && (
              <StepContainer key="topics">
                <TopicsStep
                  topics={topics}
                  updateTopic={updateTopic}
                  addTopic={addTopic}
                />
              </StepContainer>
            )}

            {currentStep === 4 && (
              <StepContainer key="preview">
                <PreviewStep
                  title={title}
                  setTitle={setTitle}
                  questions={quizQuestions}
                  duration={duration}
                  setDuration={setDuration}
                  handleSubmit={handleSubmit}
                  isProcessing={isProcessing}
                />
              </StepContainer>
            )}
          </AnimatePresence>

          <div className="md:hidden mt-6">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          <QuizNavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            handlePreviousStep={handlePreviousStep}
            handleNextStep={handleNextStep}
            canProceedToNextStep={canProceedToNextStep()}
            isProcessing={isProcessing}
            handleSubmit={handleSubmit}
          />

          <QuizActionsFooter 
            quizQuestions={quizQuestions} 
            quizId={quizId}
            title={title}
            duration={duration}
          />
        </div>
      </main>
    </div>
  );
};

export default QuizGeneration;
