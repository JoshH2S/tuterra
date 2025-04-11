
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface CourseGradesHeaderProps {
  courseName: string;
  onBack: () => void;
}

export function CourseGradesHeader({ courseName, onBack }: CourseGradesHeaderProps) {
  return (
    <>
      <Button 
        onClick={onBack} 
        className="mb-4 pl-1 flex items-center touch-manipulation hover:bg-gradient-to-br hover:from-primary-100/80 hover:to-primary-200/80 hover:text-black"
        size="sm"
        aria-label="Back to courses"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        <span>Back to Courses</span>
      </Button>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{courseName || "Course"} Grades</h1>
      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">View your quiz performance for this course</p>
    </>
  );
}
