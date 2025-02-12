
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoursesHeaderProps {
  onCreateClick: () => void;
}

export const CoursesHeader = ({ onCreateClick }: CoursesHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${isMobile ? 'gap-3' : 'gap-4'}`}>
      <div>
        <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} text-gray-900 mb-2`}>
          Courses
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
          Create and manage your courses
        </p>
      </div>
      
      <div className={`flex ${isMobile ? 'flex-col' : ''} gap-3`}>
        <Button 
          variant="outline" 
          onClick={() => navigate('/course-templates')}
          className={isMobile ? 'w-full justify-center py-6' : ''}
        >
          <Book className="mr-2 h-4 w-4" />
          Course Templates
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/quizzes')}
          className={isMobile ? 'w-full justify-center py-6' : ''}
        >
          <FileText className="mr-2 h-4 w-4" />
          View Quizzes
        </Button>
        <Button 
          onClick={onCreateClick}
          className={isMobile ? 'w-full justify-center py-6' : ''}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </div>
    </div>
  );
};
