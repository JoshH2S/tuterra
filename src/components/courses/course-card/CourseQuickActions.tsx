
import { Link } from "react-router-dom";
import { BookOpen, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseQuickActionsProps {
  courseId: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const CourseQuickActions: React.FC<CourseQuickActionsProps> = ({
  courseId,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button variant="outline" size="sm" asChild>
        <Link to={`/courses/${courseId}/grades`}>
          <BookOpen className="w-4 h-4 mr-2" />
          View Course
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            className="flex items-center py-2 px-3 cursor-pointer touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md transition-colors"
            onClick={onEditClick}
          >
            <FileEdit className="w-4 h-4 mr-2" />
            Edit Course
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center py-2 px-3 cursor-pointer touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md transition-colors text-red-600 dark:text-red-400"
            onClick={onDeleteClick}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
