import { ArrowLeft, CheckCircle, Circle, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GeneratedCourse, 
  CourseModule, 
  ModuleStep, 
  CourseProgress 
} from "@/types/course-engine";
import { cn } from "@/lib/utils";

interface ModuleSidebarProps {
  course: GeneratedCourse;
  modules: CourseModule[];
  currentModule: CourseModule | null;
  currentStep: ModuleStep | null;
  steps: ModuleStep[];
  progress: CourseProgress | null;
  onModuleSelect: (moduleIndex: number) => void;
  onStepSelect: (stepId: string) => void;
  onBack: () => void;
}

export function ModuleSidebar({
  course,
  modules,
  currentModule,
  currentStep,
  steps,
  progress,
  onModuleSelect,
  onStepSelect,
  onBack,
}: ModuleSidebarProps) {
  // Use step-based progress for consistency with main progress bar
  const totalStepsAcrossCourse = modules.length * 6; // 6 steps per module
  const completedSteps = progress?.total_steps_completed || 0;
  const progressPercent = totalStepsAcrossCourse > 0 
    ? Math.round((completedSteps / totalStepsAcrossCourse) * 100) 
    : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Course
        </Button>
        
        <h2 className="font-semibold text-sm truncate mb-1">{course.title}</h2>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{completedSteps} of {totalStepsAcrossCourse} steps completed</span>
        </div>
        
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {modules.map((module) => {
            const isActive = currentModule?.id === module.id;
            const moduleProgress = progress?.module_completion?.[module.id];
            const isCompleted = module.is_completed;
            
            return (
              <div key={module.id} className="mb-2">
                {/* Module Header */}
                <button
                  onClick={() => onModuleSelect(module.module_index)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-muted/50",
                    isCompleted && "opacity-75"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0",
                      isCompleted 
                        ? "bg-green-500 text-white" 
                        : isActive 
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        module.module_index + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {module.title}
                      </p>
                      {module.estimated_minutes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {module.estimated_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Steps List (only for current module) */}
                {isActive && steps.length > 0 && (
                  <div className="ml-6 mt-1 space-y-0.5 border-l pl-3">
                    {steps.map((step, index) => {
                      const isCurrentStep = currentStep?.id === step.id;
                      const isStepCompleted = step.is_completed;
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => onStepSelect(step.id)}
                          className={cn(
                            "w-full text-left py-2 px-2 rounded text-sm transition-colors flex items-center gap-2",
                            isCurrentStep 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {isStepCompleted ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className={cn(
                              "h-3.5 w-3.5 flex-shrink-0",
                              isCurrentStep ? "text-primary" : "text-muted-foreground/50"
                            )} />
                          )}
                          <span className="truncate">
                            {step.title || `${step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)} ${index + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
