
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseSelector } from "@/components/quiz-generation/CourseSelector";
import { QuizDifficultySelector } from "@/components/quiz-generation/QuizDifficultySelector";
import { QuestionDifficulty } from "@/types/quiz";
import { QuizTitleInput } from "@/components/quiz-generation/QuizTitleInput";

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Quiz Setup</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure the basic settings for your quiz
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuizTitleInput title={title} onChange={setTitle} />
            
          <CourseSelector
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
          />

          <QuizDifficultySelector
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </CardContent>
      </Card>
    </div>
  );
};
