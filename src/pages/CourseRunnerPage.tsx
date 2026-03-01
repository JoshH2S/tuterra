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
    <>
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

      {/* Main Content - white canvas (sidebar keeps its own styling) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top Progress Bar */}
        <div className="border-b bg-white px-6 py-3">
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
          <div className="border-t bg-white px-6 py-4">
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
