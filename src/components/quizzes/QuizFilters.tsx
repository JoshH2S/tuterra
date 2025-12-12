
import { Search, Filter, Plus, RefreshCw } from "lucide-react";
import { Select } from "@/components/ui/select-simple";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";

interface QuizFiltersProps {
  searchTerm: string;
  selectedCourse: string;
  selectedStatus: string;
  courses: Course[];
  setSearchTerm: (value: string) => void;
  setSelectedCourse: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  handleCreateQuiz: () => void;
  refreshQuizzes?: () => void; 
}

export function QuizFilters({
  searchTerm,
  selectedCourse,
  selectedStatus,
  courses,
  setSearchTerm,
  setSelectedCourse,
  setSelectedStatus,
  handleCreateQuiz,
  refreshQuizzes
}: QuizFiltersProps) {
  // Build course options for the select dropdown
  const courseOptions = [
    { label: 'All Courses', value: 'all' },
    ...courses.map(course => ({
      label: course.title || course.id,
      value: course.id
    }))
  ];

  return (
    <>
      {/* Page Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Available Quizzes
          </h1>
          <p className="text-white/80 mt-1">
            View and manage your course quizzes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {refreshQuizzes && (
            <Button 
              variant="outline" 
              onClick={refreshQuizzes} 
              size="icon" 
              title="Refresh quizzes"
              className="touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline"
            className="touch-manipulation"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Create Quiz button clicked');
              handleCreateQuiz();
            }}
            className="touch-manipulation relative z-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          placeholder="Course"
          options={courseOptions}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-48"
        />
        
        <Select
          placeholder="Status"
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Not Attempted', value: 'not_attempted' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' }
          ]}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-48"
        />
      </div>
    </>
  );
}
