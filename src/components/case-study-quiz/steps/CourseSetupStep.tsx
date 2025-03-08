
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card>
          <CardHeader>
            <CardTitle>Course Selection</CardTitle>
            <CardDescription>
              Choose the course for your case study quiz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseSelection
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Level</CardTitle>
            <CardDescription>
              Set the complexity of case studies and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DifficultySelector
              value={difficulty}
              onChange={setDifficulty}
              options={[
                {
                  value: "middle_school",
                  label: "Middle School",
                  description: "Basic concepts and simple analysis"
                },
                {
                  value: "high_school",
                  label: "High School",
                  description: "Intermediate concepts and analysis"
                },
                {
                  value: "university",
                  label: "University",
                  description: "Advanced concepts and detailed analysis"
                },
                {
                  value: "post_graduate",
                  label: "Post Graduate",
                  description: "Complex scenarios and critical thinking"
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
