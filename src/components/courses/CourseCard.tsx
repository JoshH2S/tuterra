import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  onFileSelect: (file: File, courseId: string) => Promise<void>;
}

const CourseCard = ({ course, onFileSelect }: CourseCardProps) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 
        className="text-xl font-semibold mb-4 cursor-pointer hover:text-blue-600 transition-colors" 
        onClick={handleCourseClick}
      >
        {course.title}
      </h2>
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
      </div>
    </div>
  );
};

export default CourseCard;