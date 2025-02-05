import { Navigation } from "@/components/Navigation";
import { LessonPlanningHeader } from "@/components/lesson-planning/LessonPlanningHeader";
import { ObjectiveInput } from "@/components/lesson-planning/ObjectiveInput";
import { ObjectivesCard } from "@/components/lesson-planning/ObjectivesCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { LessonPlanOutput } from "@/components/lesson-planning/LessonPlanOutput";
import { useLessonPlan } from "@/hooks/useLessonPlan";

const LessonPlanning = () => {
  const {
    selectedFile,
    objectives,
    isProcessing,
    lessonPlan,
    contentLength,
    handleFileSelect,
    addObjective,
    updateObjective,
    handleSubmit,
  } = useLessonPlan();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LessonPlanningHeader />
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <ObjectiveInput
              objective={objectives[objectives.length - 1]}
              index={objectives.length - 1}
              onChange={updateObjective}
            />
            <ObjectivesCard 
              objectives={objectives}
              onObjectiveChange={updateObjective}
              onAddObjective={addObjective}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              isSubmitDisabled={isProcessing || !selectedFile || objectives.some(obj => !obj.description)}
            />
            <CourseMaterialUpload 
              onFileSelect={handleFileSelect}
              contentLength={contentLength}
            />
          </div>
          
          <LessonPlanOutput
            lessonPlan={lessonPlan}
          />
        </div>
      </main>
    </div>
  );
};

export default LessonPlanning;