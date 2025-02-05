import { Navigation } from "@/components/Navigation";
import { LessonPlanningHeader } from "@/components/lesson-planning/LessonPlanningHeader";
import { ObjectiveInput } from "@/components/lesson-planning/ObjectiveInput";
import { ObjectivesCard } from "@/components/lesson-planning/ObjectivesCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { LessonPlanOutput } from "@/components/lesson-planning/LessonPlanOutput";
import { useLessonPlan } from "@/hooks/useLessonPlan";

const LessonPlanning = () => {
  const {
    objectives,
    setObjectives,
    addObjective,
    removeObjective,
    uploadStatus,
    handleFileUpload,
    generatedPlan,
    isGenerating,
    generatePlan,
  } = useLessonPlan();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LessonPlanningHeader />
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <ObjectiveInput onAdd={addObjective} />
            <ObjectivesCard 
              objectives={objectives} 
              onRemove={removeObjective}
            />
            <CourseMaterialUpload 
              onUpload={handleFileUpload}
              uploadStatus={uploadStatus}
            />
          </div>
          
          <LessonPlanOutput
            objectives={objectives}
            isGenerating={isGenerating}
            generatedPlan={generatedPlan}
            onGenerate={generatePlan}
          />
        </div>
      </main>
    </div>
  );
};

export default LessonPlanning;