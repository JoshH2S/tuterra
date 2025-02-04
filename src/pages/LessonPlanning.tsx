import Navigation from "@/components/Navigation";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { ObjectivesCard } from "@/components/lesson-planning/ObjectivesCard";
import { LessonPlanOutput } from "@/components/lesson-planning/LessonPlanOutput";
import { LessonPlanningHeader } from "@/components/lesson-planning/LessonPlanningHeader";
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <LessonPlanningHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CourseMaterialUpload
            onFileSelect={handleFileSelect}
            contentLength={contentLength}
          />

          <ObjectivesCard
            objectives={objectives}
            onObjectiveChange={updateObjective}
            onAddObjective={addObjective}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            isSubmitDisabled={isProcessing || !selectedFile || objectives.some(obj => !obj.description)}
          />

          <LessonPlanOutput lessonPlan={lessonPlan} />
        </div>
      </div>
    </div>
  );
};

export default LessonPlanning;