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
import { ModuleStartConfirmation } from "@/components/course-engine/ModuleStartConfirmation";
import { ModuleGenerationLoading } from "@/components/course-engine/ModuleGenerationLoading";
import { CourseCompletionScreen } from "@/components/course-engine/CourseCompletionScreen";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { CourseModule } from "@/types/course-engine";
import { useToast } from "@/hooks/use-toast";

const CourseRunnerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showModuleConfirmation, setShowModuleConfirmation] = useState(false);
  const [pendingModule, setPendingModule] = useState<CourseModule | null>(null);
  const [isGeneratingModule, setIsGeneratingModule] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

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
    previousSubmission,
    lastSubmissionPassing,
    loadCourse,
    loadModuleSteps,
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

  // Auto-load steps when current module changes (only on the runner page, not the detail page)
  useEffect(() => {
    if (currentModule) {
      loadModuleSteps(currentModule.id);
    }
  }, [currentModule, loadModuleSteps]);

  useEffect(() => {
    if (lastFeedback) {
      setShowFeedback(true);
    }
  }, [lastFeedback]);

  // If the course is already complete (e.g. user refreshes after finishing), show the completion screen.
  useEffect(() => {
    if (progress?.completed_at) {
      setShowCompletion(true);
    }
  }, [progress?.completed_at]);

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

  const handleRetry = () => {
    setShowFeedback(false);
  };

  // Calculate which modules are locked (all modules after the furthest reached)
  const getLockedModuleIndices = (): number[] => {
    if (!progress) return [];
    
    // Find the highest module index that has been started (has steps loaded or is completed)
    let highestReachedIndex = 0;
    modules.forEach((module) => {
      if (module.is_completed || progress.current_module_id === module.id) {
        highestReachedIndex = Math.max(highestReachedIndex, module.module_index);
      }
    });
    
    // Lock all modules beyond highestReachedIndex + 1
    return modules
      .filter((m) => m.module_index > highestReachedIndex + 1)
      .map((m) => m.module_index);
  };

  const lockedModuleIndices = getLockedModuleIndices();

  const handleModuleSelect = (moduleIndex: number) => {
    // Check if module is locked
    if (lockedModuleIndices.includes(moduleIndex)) {
      return; // Shouldn't happen due to UI, but guard anyway
    }
    
    const targetModule = modules.find((m) => m.module_index === moduleIndex);
    if (!targetModule) return;
    
    const isNextModule = currentModule && moduleIndex === currentModule.module_index + 1;

    // Guard: next module is only accessible if the current module is fully complete
    if (isNextModule && currentModule) {
      const allStepsDone = steps.length > 0 && steps.every(s => s.is_completed);
      const moduleComplete = currentModule.is_completed || allStepsDone;
      if (!moduleComplete) {
        toast({
          title: 'Module not complete',
          description: 'Please complete all steps in the current module before moving on.',
          variant: 'destructive',
        });
        return;
      }
    }

    // If this is the next unstarted module, show confirmation dialog
    const hasStepsAlready = targetModule.id === progress?.current_module_id || targetModule.is_completed;
    
    if (isNextModule && !hasStepsAlready) {
      setPendingModule(targetModule);
      setShowModuleConfirmation(true);
    } else {
      // Navigate directly (already generated or going back)
      navigateToModule(moduleIndex);
    }
  };

  const handleConfirmModuleStart = async () => {
    if (!pendingModule) return;
    
    setShowModuleConfirmation(false);
    setIsGeneratingModule(true);
    
    try {
      // Navigate to the module (this will trigger loadModuleSteps via useEffect in useCourseRunner)
      await navigateToModule(pendingModule.module_index);
    } finally {
      setIsGeneratingModule(false);
      setPendingModule(null);
    }
  };

  const handleCancelModuleStart = () => {
    setShowModuleConfirmation(false);
    setPendingModule(null);
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
        // Show confirmation for next module
        setPendingModule(nextModule);
        setShowModuleConfirmation(true);
      } else {
        // Course complete! Show the completion screen.
        setShowCompletion(true);
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

  if (showCompletion) {
    const totalStepsInCourse = Math.max(
      progress?.total_steps_completed ?? 0,
      modules.length * 6
    );
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-light/50 to-white px-4 py-10 sm:px-8">
        <CourseCompletionScreen
          course={course}
          modules={modules}
          totalStepsCompleted={progress?.total_steps_completed ?? 0}
          totalStepsInCourse={totalStepsInCourse}
          onBackToCourse={() => navigate(`/courses/generated/${id}`)}
          onBackToCourses={() => navigate('/courses/generated')}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[100dvh] bg-background">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50"
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
            lockedModuleIndices={lockedModuleIndices}
            onModuleSelect={(index) => {
              handleModuleSelect(index);
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
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-brand-light/40 to-white">
        {/* Top bar — editorial chapter header */}
        <div className="border-b border-primary-300/30 bg-white/80 backdrop-blur-sm px-4 sm:px-8 pt-4 pb-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <div className="flex items-baseline gap-3 min-w-0 flex-1">
                {currentModule && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-600 shrink-0">
                    Module {String(currentModule.module_index + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="h-px w-6 bg-primary-300/60 shrink-0" />
                <span className="font-bitter text-base sm:text-lg font-medium text-primary-900 truncate">
                  {currentModule?.title}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-muted shrink-0 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-primary-300/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6">
          <div className="max-w-3xl mx-auto">
            {isLoadingSteps ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            ) : showFeedback && lastFeedback ? (
              <FeedbackDisplay 
                feedback={lastFeedback}
                isPassing={lastSubmissionPassing ?? false}
                onContinue={handleNextStep}
                onRetry={handleRetry}
              />
            ) : currentStep ? (
              <StepRenderer
                step={currentStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onTeachComplete={handleTeachComplete}
                previousSubmission={previousSubmission}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No content available</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer — refined chapter pagination */}
        {!showFeedback && currentStep && (
          <div className="border-t border-primary-300/30 bg-white/80 backdrop-blur-sm px-4 sm:px-8 py-4 safe-area-bottom">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <button
                onClick={handlePreviousStep}
                disabled={isFirstStep}
                className={cn(
                  "group flex items-center gap-2 text-sm font-medium transition-colors",
                  isFirstStep
                    ? "text-neutral-muted/40 cursor-not-allowed"
                    : "text-neutral-muted hover:text-primary-700"
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Segmented step indicator */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-muted tabular-nums">
                  Step {String(currentStepIndex + 1).padStart(2, "0")}
                  <span className="text-primary-300 mx-1.5">/</span>
                  {String(steps.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5">
                  {steps.map((s, i) => (
                    <span
                      key={s.id}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentStepIndex
                          ? "w-6 bg-gradient-to-r from-primary-400 to-primary-600"
                          : s.is_completed
                          ? "w-1.5 bg-primary-500"
                          : "w-1.5 bg-primary-300/50"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Continue button only for legacy teach steps without slides */}
              {currentStep.step_type === 'teach' &&
               (!currentStep.content.slides || currentStep.content.slides.length === 0) ? (
                <Button
                  onClick={handleNextStep}
                  size={isMobile ? "sm" : "default"}
                  className={cn(
                    "bg-gradient-to-br from-primary-400 to-primary-600 text-white",
                    "shadow-[0_4px_14px_-4px_rgba(184,134,11,0.5)]",
                    "hover:from-primary-500 hover:to-primary-700"
                  )}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
                </Button>
              ) : (
                <div className="w-[60px] sm:w-[80px]" />
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Module Start Confirmation Dialog */}
      <ModuleStartConfirmation
        open={showModuleConfirmation}
        module={pendingModule}
        onConfirm={handleConfirmModuleStart}
        onCancel={handleCancelModuleStart}
      />

      {/* Module Generation Loading Overlay */}
      {isGeneratingModule && pendingModule && (
        <ModuleGenerationLoading moduleTitle={pendingModule.title} />
      )}
      
      {/* Also show loading during initial step load (but not if showing feedback) */}
      {!showFeedback && isLoadingSteps && currentModule && (
        <ModuleGenerationLoading moduleTitle={currentModule.title} />
      )}
    </>
  );
};

export default CourseRunnerPage;
