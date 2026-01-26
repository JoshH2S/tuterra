import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Loader2,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PremiumCard } from "@/components/ui/premium-card";
import { useCourseRunner } from "@/hooks/useCourseRunner";
import { StepRenderer } from "@/components/course-engine/StepRenderer";
import { ModuleSidebar } from "@/components/course-engine/ModuleSidebar";
import { FeedbackDisplay } from "@/components/course-engine/FeedbackDisplay";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const CourseRunnerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    course,
    modules,
    currentModule,
    currentStep,
    steps,
    progress,
    isLoading,
    isLoadingSteps,
    isSubmitting,
    lastFeedback,
    loadCourse,
    submitStep,
    markStepComplete,
    navigateToStep,
    navigateToModule,
    getProgressPercentage,
  } = useCourseRunner();

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id, loadCourse]);

  useEffect(() => {
    if (lastFeedback) {
      setShowFeedback(true);
    }
  }, [lastFeedback]);

  const handleSubmit = async (submission: any) => {
    const result = await submitStep(submission);
    if (result.success && result.nextStepId) {
      // Auto-advance after feedback is dismissed
    }
  };

  const handleTeachComplete = async () => {
    const result = await markStepComplete();
    if (result.success) {
      handleNextStep();
    }
  };

  const handleNextStep = () => {
    setShowFeedback(false);
    
    if (!currentStep || !steps.length) return;
    
    const currentIndex = steps.findIndex(s => s.id === currentStep.id);
    if (currentIndex < steps.length - 1) {
      navigateToStep(steps[currentIndex + 1].id);
    } else if (currentModule) {
      // Check if there's a next module
      const nextModuleIndex = currentModule.module_index + 1;
      const nextModule = modules.find(m => m.module_index === nextModuleIndex);
      if (nextModule) {
        navigateToModule(nextModuleIndex);
      } else {
        // Course complete!
        navigate(`/courses/generated/${id}`);
      }
    }
  };

  const handlePreviousStep = () => {
    if (!currentStep || !steps.length) return;
    
    const currentIndex = steps.findIndex(s => s.id === currentStep.id);
    if (currentIndex > 0) {
      navigateToStep(steps[currentIndex - 1].id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PremiumCard className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            This course may have been deleted or you don't have access.
          </p>
          <Button onClick={() => navigate('/courses/generated')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </PremiumCard>
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const currentStepIndex = currentStep ? steps.findIndex(s => s.id === currentStep.id) : -1;
  const isFirstStep = currentStepIndex === 0 && currentModule?.module_index === 0;
  const isLastStep = currentStepIndex === steps.length - 1 && 
    currentModule?.module_index === modules.length - 1;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r transform transition-transform duration-200",
        isMobile && !showSidebar && "-translate-x-full",
        !isMobile && "relative translate-x-0"
      )}>
        <ModuleSidebar
          course={course}
          modules={modules}
          currentModule={currentModule}
          currentStep={currentStep}
          steps={steps}
          progress={progress}
          onModuleSelect={(index) => {
            navigateToModule(index);
            if (isMobile) setShowSidebar(false);
          }}
          onStepSelect={(stepId) => {
            navigateToStep(stepId);
            if (isMobile) setShowSidebar(false);
          }}
          onBack={() => navigate(`/courses/generated/${id}`)}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Progress Bar */}
        <div className="border-b bg-card px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {currentModule?.title}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progressPercent}% complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {isLoadingSteps ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            ) : showFeedback && lastFeedback ? (
              <FeedbackDisplay 
                feedback={lastFeedback} 
                onContinue={handleNextStep}
              />
            ) : currentStep ? (
              <StepRenderer
                step={currentStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onTeachComplete={handleTeachComplete}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No content available</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        {!showFeedback && currentStep && (
          <div className="border-t bg-card px-6 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isFirstStep}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
              </div>

              {/* Only show Continue button for legacy teach steps without slides */}
              {currentStep.step_type === 'teach' && 
               (!currentStep.content.slides || currentStep.content.slides.length === 0) && (
                <Button onClick={handleNextStep}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {/* Spacer for non-teach steps or slide-based teach steps */}
              {(currentStep.step_type !== 'teach' || 
                (currentStep.content.slides && currentStep.content.slides.length > 0)) && (
                <div className="w-[100px]" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRunnerPage;
