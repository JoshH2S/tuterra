
import { useState, useEffect, useMemo } from "react";
import { CreateCourseModal } from "@/components/courses/CreateCourseModal";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { CoursesGrid } from "@/components/courses/CoursesGrid";
import { CoursesEmptyState } from "@/components/courses/CoursesEmptyState";
import { useCourses } from "@/hooks/useCourses";
import { CourseCreateData } from "@/types/course";
import { toast } from "@/hooks/use-toast";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { CourseErrorBoundary } from "@/components/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

const Courses = () => {
  const { 
    createCourse, 
    courses, 
    isLoading, 
    isCreating, 
    error, 
    refreshCourses, 
    retryFetchCourses 
  } = useCourses();
  
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  
  // Debounce search input to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered courses for performance
  const filteredCourses = useMemo(() => {
    if (isLoading) return [];
    
    return courses
      .filter(course => {
        if (!debouncedSearchQuery) return true;
        return course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === "alpha") {
          return a.title.localeCompare(b.title);
        }
        // Safe date handling with fallbacks
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Recent first
      });
  }, [courses, debouncedSearchQuery, sortBy, isLoading]);

  // Apply status filtering if available
  const filteredByStatus = useMemo(() => {
    if (filterBy === 'all') return filteredCourses;
    // Only filter if status is defined on the course
    return filteredCourses.filter(course => 
      course.status === filterBy || (filterBy === 'active' && !course.status)
    );
  }, [filteredCourses, filterBy]);

  const handleCreateClick = () => {
    setIsCreatingModal(true);
  };

  const handleCloseModal = () => {
    setIsCreatingModal(false);
  };

  const handleCreateCourse = async (data: CourseCreateData) => {
    const success = await createCourse(data);
    if (success) {
      setIsCreatingModal(false);
    }
    return success;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const handleFilter = (value: string) => {
    setFilterBy(value);
  };

  const handleCourseDeleted = () => {
    refreshCourses();
  };

  const handleCourseUpdated = () => {
    refreshCourses();
  };

  // Render error state with retry option
  if (error && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CoursesHeader 
          onCreateClick={handleCreateClick}
          onSearch={handleSearch}
          onSort={handleSort}
          onFilter={handleFilter}
        />
        
        <Alert variant="destructive" className="my-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Failed to load courses</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">There was an error loading your courses. Please try again.</p>
            <Button 
              onClick={retryFetchCourses} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CoursesHeader 
        onCreateClick={handleCreateClick}
        onSearch={handleSearch}
        onSort={handleSort}
        onFilter={handleFilter}
      />
      
      <CreateCourseModal
        isOpen={isCreatingModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateCourse}
        isCreating={isCreating}
      />

      <CourseErrorBoundary>
        {isLoading ? (
          <AdaptiveLoading />
        ) : filteredByStatus.length > 0 ? (
          <CoursesGrid 
            courses={filteredByStatus} 
            onCourseDeleted={handleCourseDeleted} 
            onCourseUpdated={handleCourseUpdated}
            isLoading={isCreating}
          />
        ) : (
          searchQuery ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found matching "{searchQuery}"</p>
              <Button onClick={() => setSearchQuery("")} variant="link" className="mt-2">
                Clear search
              </Button>
            </div>
          ) : (
            <CoursesEmptyState onCreateClick={handleCreateClick} />
          )
        )}
      </CourseErrorBoundary>
    </div>
  );
};

export default Courses;
