
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { CourseSelectionStep } from "@/components/quiz-generation/steps/CourseSelectionStep";
import { MaterialUploadStep } from "@/components/quiz-generation/steps/MaterialUploadStep";
import { TopicsStep } from "@/components/quiz-generation/steps/TopicsStep";
import { PreviewStep } from "@/components/quiz-generation/steps/PreviewStep";
import { StepIndicator } from "@/components/quiz-generation/StepIndicator";
import { useQuizGeneration } from "@/hooks/quiz/useQuizGeneration";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const QuizGeneration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const {
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    contentLength,
    duration,
    selectedCourseId,
    difficulty,
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
        return !!selectedCourseId;
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
        `Quiz Template - ${topics.map(t => t.description).join(", ")}`,
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

  const handlePublishQuiz = async () => {
    try {
      const { data: latestQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestQuiz) {
        toast({
          title: "Error",
          description: "No quiz found to publish",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('quizzes')
        .update({ 
          published: true,
          duration_minutes: duration 
        })
        .eq('id', latestQuiz.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz published successfully!",
      });
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to publish quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Header */}
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
          {/* Step-based Content with AnimatePresence for transitions */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepContainer key="course-selection">
                <CourseSelectionStep
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
                  questions={quizQuestions}
                  duration={duration}
                  setDuration={setDuration}
                  handleSubmit={handleSubmit}
                  isProcessing={isProcessing}
                />
              </StepContainer>
            )}
          </AnimatePresence>

          {/* Mobile step indicator */}
          <div className="md:hidden mt-6">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              className="px-4 py-2 h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={!canProceedToNextStep()}
              className="px-6 py-2 h-12"
            >
              {currentStep === 4 ? 'Generate Quiz' : 'Next'}
              {currentStep !== 4 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Publish and Navigation Buttons at the bottom */}
          {quizQuestions.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Card className="bg-gray-50 dark:bg-gray-800/50 p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Button 
                    onClick={handlePublishQuiz}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Publish Quiz
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row w-full justify-center gap-4 mt-4">
                    <Link to="/case-study-quiz" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Case Study Quiz
                      </Button>
                    </Link>
                    
                    <Link to="/quizzes" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        View Quizzes
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Wrapper component for step animations
const StepContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="mb-6"
  >
    {children}
  </motion.div>
);

export default QuizGeneration;
