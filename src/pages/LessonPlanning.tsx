
import { LessonPlanningHeaderWithTemplates } from "@/components/lesson-planning/LessonPlanningHeaderWithTemplates";
import { ObjectiveInput } from "@/components/lesson-planning/ObjectiveInput";
import { ObjectivesCard } from "@/components/lesson-planning/ObjectivesCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { LessonPlanOutput } from "@/components/lesson-planning/LessonPlanOutput";
import { useLessonPlan } from "@/hooks/useLessonPlan";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";

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

  const { createTemplate } = useCourseTemplates();

  const handleSaveTemplate = async () => {
    if (lessonPlan) {
      await createTemplate(
        `Lesson Plan Template - ${objectives.map(obj => obj.description).join(", ")}`,
        {
          type: "lesson_plan",
          objectives,
          content: lessonPlan
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <LessonPlanningHeaderWithTemplates onSaveTemplate={lessonPlan ? handleSaveTemplate : undefined} />
        
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
