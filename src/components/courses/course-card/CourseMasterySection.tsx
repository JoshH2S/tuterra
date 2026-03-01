
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseMasterySectionProps {
  completedQuizzes: number;
  maxQuizzes: number;
  expertiseLevel: string;
  progressValue: number;
}

export const CourseMasterySection: React.FC<CourseMasterySectionProps> = ({ 
  completedQuizzes, 
  maxQuizzes, 
  expertiseLevel,
  progressValue
}) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Course Mastery</span>
        <span className="text-xs text-gray-500">
          {expertiseLevel} ({completedQuizzes}/{maxQuizzes} quizzes)
        </span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-1.5 bg-gray-100"
        indicatorClassName="bg-gray-700"
      />
    </div>
  );
};
