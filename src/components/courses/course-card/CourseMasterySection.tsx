
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
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Course Mastery</span>
        <span className="text-sm text-gray-600">
          {expertiseLevel} ({completedQuizzes}/{maxQuizzes} quizzes)
        </span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-2"
        indicatorClassName={cn(
          progressValue >= 100 ? "bg-green-600" :
          progressValue >= 70 ? "bg-blue-600" :
          progressValue >= 40 ? "bg-yellow-500" :
          progressValue >= 10 ? "bg-orange-500" : "bg-gray-400"
        )}
      />
    </div>
  );
};
