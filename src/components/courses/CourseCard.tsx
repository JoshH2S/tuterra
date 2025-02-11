
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Course } from "@/types/course";
import { Trash2, FileText, Book } from "lucide-react";
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
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
      </div>
      <FileUpload 
        onFileSelect={(file) => onFileSelect(file, course.id)}
        acceptedTypes=".pdf,.doc,.docx,.txt"
      />
      <div className="mt-4 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCourseClick}
        >
          View Course Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTemplatesClick}
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          Manage Templates
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleQuizGenerationClick}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Quiz
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
