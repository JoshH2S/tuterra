
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CoursesHeaderProps {
  onCreateClick: () => void;
  onSearch?: (query: string) => void;
  onSort?: (value: string) => void;
  onFilter?: (value: string) => void;
}

export const CoursesHeader = ({ 
  onCreateClick, 
  onSearch, 
  onSort, 
  onFilter 
}: CoursesHeaderProps) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200`}>
            Courses
          </h1>
          <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : ''} mt-1`}>
            Create and manage your courses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/quizzes')}
            className={isMobile ? 'px-3 py-2 text-sm' : ''}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            View Quizzes
          </Button>
          
          <Button 
            onClick={onCreateClick}
            className={isMobile ? 'px-3 py-2 text-sm' : ''}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Course
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select onValueChange={(value) => onSort && onSort(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Created</SelectItem>
              <SelectItem value="alpha">Alphabetical</SelectItem>
              <SelectItem value="students">Most Students</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => onFilter && onFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
