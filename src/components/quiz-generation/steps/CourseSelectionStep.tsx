
import React from "react";
import { CourseSelector } from "@/components/quiz-generation/CourseSelector";
import { QuizDifficultySelector } from "@/components/quiz-generation/QuizDifficultySelector";
import { QuestionDifficulty } from "@/types/quiz";
import { QuizTitleInput } from "@/components/quiz-generation/QuizTitleInput";
import { FileText } from "lucide-react";
import { StepHeader } from "@/components/quiz-generation/StepHeader";

interface CourseSelectionStepProps {
  title: string;
  setTitle: (title: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export const CourseSelectionStep = ({
  title,
  setTitle,
  selectedCourseId,
  setSelectedCourseId,
  difficulty,
  setDifficulty,
}: CourseSelectionStepProps) => {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Quiz Setup"
        description="Configure the basic settings for your quiz"
        icon={FileText}
      />

      <div className="bg-white border border-black/[0.06] rounded-xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-6">
        <QuizTitleInput title={title} onChange={setTitle} />
        <CourseSelector
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
        />
        <QuizDifficultySelector
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      </div>
    </div>
  );
};
