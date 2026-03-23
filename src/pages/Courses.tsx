
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
import { AlertTriangle, RefreshCw, BookOpenText, Plus } from "lucide-react";
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
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white" />

      {/* Hero Card */}
      <div className="-mt-6 -mx-6 mb-8 relative z-10">
        <div className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden bg-[#F7F3EC] min-h-[220px]">
          {/* Image fills the right half absolutely — no gap possible */}
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-[58%] bg-cover bg-center"
            style={{ backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-donghuangmingde-2177482.jpg')" }}
          />
          {/* Gradient fade so text stays readable over the image on small screens */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EC] via-[#F7F3EC]/90 sm:via-[#F7F3EC]/0 to-transparent" />
          {/* Text content */}
          <div className="relative z-10 flex flex-col p-8 sm:w-[45%] justify-center gap-4 min-h-[220px]">
            <div>
              <p className="text-xs font-mono text-[#8a7a5a] mb-3 tracking-wide uppercase">Learning Library</p>
              <div className="flex items-start gap-3 mb-3">
                <BookOpenText className="h-7 w-7 text-[#7a6a2a] mt-0.5 shrink-0" />
                <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">Course Engine</h1>
              </div>
              <p className="text-sm text-[#5a5040] leading-relaxed">Generate personalised courses on any topic with AI-powered learning paths.</p>
            </div>
            <div>
              <Button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-6 py-5 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition-all font-semibold"
              >
                <Plus className="h-5 w-5" />
                What do you want to learn?
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
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
    </>
  );
};

export default Courses;
