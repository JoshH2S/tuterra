
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Book } from "lucide-react";
import { QuestionDifficulty } from "@/types/quiz";
import { CourseSelection } from "@/components/case-study-quiz/CourseSelection";
import { DifficultySelector } from "@/components/case-study-quiz/DifficultySelector";

interface CourseSetupStepProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export const CourseSetupStep = ({
  selectedCourseId,
  setSelectedCourseId,
  difficulty,
  setDifficulty,
}: CourseSetupStepProps) => {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Course Setup"
        description="Select the course and difficulty level for your case study"
        icon={Book}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Course Selection panel */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-1">
          <h3 className="text-sm font-medium text-[#091747]">Course Selection</h3>
          <p className="text-xs text-stone-400 mb-4">Choose the course for your case study quiz</p>
          <CourseSelection
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>

        {/* Difficulty Level panel */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-1">
          <h3 className="text-sm font-medium text-[#091747]">Difficulty Level</h3>
          <p className="text-xs text-stone-400 mb-4">Set the complexity of case studies and questions</p>
          <DifficultySelector
            value={difficulty}
            onChange={setDifficulty}
            options={[
              {
                value: "middle_school",
                label: "Middle School",
                description: "Basic concepts and simple analysis",
              },
              {
                value: "high_school",
                label: "High School",
                description: "Intermediate concepts and analysis",
              },
              {
                value: "university",
                label: "University",
                description: "Advanced concepts and detailed analysis",
              },
              {
                value: "post_graduate",
                label: "Post Graduate",
                description: "Complex scenarios and critical thinking",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
