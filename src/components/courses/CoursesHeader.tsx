import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface CoursesHeaderProps {
  onCreateClick: () => void;
}

export const CoursesHeader = ({ onCreateClick }: CoursesHeaderProps) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-gray-600">Create and manage your courses</p>
      </div>
      <Button onClick={onCreateClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Course
      </Button>
    </div>
  );
};