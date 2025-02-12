
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Course } from "@/types/course";
import { Book, FileText, MoreVertical, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseCardProps {
  course: Course;
  onFileSelect: (file: File, courseId: string) => Promise<void>;
  onDelete: (courseId: string) => Promise<void>;
}

const CourseCard = ({ course, onFileSelect, onDelete }: CourseCardProps) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleQuizGenerationClick = () => {
    navigate(`/courses/${course.id}/quiz-generation`);
  };

  const handleTemplatesClick = () => {
    navigate(`/course-templates`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 
          className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors" 
          onClick={handleCourseClick}
        >
          {course.title}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCourseClick}>
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTemplatesClick}>
              <Book className="h-4 w-4 mr-2" />
              Manage Templates
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleQuizGenerationClick}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Quiz
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{course.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onDelete(course.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <FileUpload 
        onFileSelect={(file) => onFileSelect(file, course.id)}
        acceptedTypes=".pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default CourseCard;
