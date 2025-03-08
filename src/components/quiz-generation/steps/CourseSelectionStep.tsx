
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionDifficulty } from "@/types/quiz";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";
import { Book, GraduationCap, School, Trophy } from "lucide-react";

interface CourseSelectionStepProps {
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export const CourseSelectionStep = ({ 
  selectedCourseId, 
  setSelectedCourseId, 
  difficulty, 
  setDifficulty 
}: CourseSelectionStepProps) => {
  const { courses, isLoading: isLoadingCourses } = useCourses();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course & Difficulty</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the course and education level for your quiz
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={isLoadingCourses}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education Level</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={difficulty}
              onValueChange={(value: QuestionDifficulty) => setDifficulty(value)}
              className="grid grid-cols-2 gap-4"
            >
              <LevelOption 
                value="middle_school" 
                label="Middle School" 
                icon={<School className="h-5 w-5" />} 
                currentValue={difficulty}
              />
              <LevelOption 
                value="high_school" 
                label="High School" 
                icon={<Book className="h-5 w-5" />} 
                currentValue={difficulty}
              />
              <LevelOption 
                value="university" 
                label="University" 
                icon={<GraduationCap className="h-5 w-5" />} 
                currentValue={difficulty}
              />
              <LevelOption 
                value="post_graduate" 
                label="Post Graduate" 
                icon={<Trophy className="h-5 w-5" />} 
                currentValue={difficulty}
              />
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface LevelOptionProps {
  value: QuestionDifficulty;
  label: string;
  icon: React.ReactNode;
  currentValue: QuestionDifficulty;
}

const LevelOption = ({ value, label, icon, currentValue }: LevelOptionProps) => (
  <Label
    htmlFor={`level-${value}`}
    className={cn(
      "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
      "hover:bg-primary/5",
      currentValue === value 
        ? "border-primary bg-primary/10" 
        : "border-gray-200 dark:border-gray-700"
    )}
  >
    <RadioGroupItem 
      value={value} 
      id={`level-${value}`} 
      className="sr-only" 
    />
    {icon}
    <span className="mt-2 text-sm font-medium">{label}</span>
  </Label>
);

// Import cn function if not already in scope
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
