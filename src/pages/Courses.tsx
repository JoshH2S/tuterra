
import { useState, useEffect } from "react";
import { CreateCourseModal } from "@/components/courses/CreateCourseModal";
import { CoursesHeader } from "@/components/courses/CoursesHeader";
import { CoursesGrid } from "@/components/courses/CoursesGrid";
import { CoursesEmptyState } from "@/components/courses/CoursesEmptyState";
import { useCourses } from "@/hooks/useCourses";
import { Course } from "@/types/course";
import { toast } from "@/hooks/use-toast";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";

const Courses = () => {
  const { createCourse, courses, isLoading, refreshCourses } = useCourses();
  const [isCreating, setIsCreating] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    if (!isLoading) {
      let result = [...courses];
      
      // Apply search
      if (searchQuery) {
        result = result.filter(course => 
          course.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply sorting
      if (sortBy === "alpha") {
        result = result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === "recent") {
        result = result.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      // Note: 'students' sort would need actual student count data
      
      // Apply filtering
      if (filterBy === "active" || filterBy === "archived") {
        // This would require a status field in the course data
        // result = result.filter(course => course.status === filterBy);
      }
      
      setFilteredCourses(result);
    }
  }, [courses, isLoading, searchQuery, sortBy, filterBy]);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
  };

  const handleCreateCourse = async (data: { code: string; title: string; description: string }) => {
    const success = await createCourse(data.title);
    if (success) {
      toast({
        title: "Course created",
        description: `${data.title} has been created successfully.`,
      });
      setIsCreating(false);
      await refreshCourses(); // Explicitly refresh courses after successful creation
    }
    return success; // Return success state to handle modal submission state
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
    refreshCourses(); // Refresh the course list when a course is deleted
  };

  const handleCourseUpdated = () => {
    refreshCourses(); // Refresh the course list when a course is updated
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CoursesHeader 
        onCreateClick={handleCreateClick}
        onSearch={handleSearch}
        onSort={handleSort}
        onFilter={handleFilter}
      />
      
      <CreateCourseModal
        isOpen={isCreating}
        onClose={handleCloseModal}
        onSubmit={handleCreateCourse}
      />

      {isLoading ? (
        <AdaptiveLoading />
      ) : filteredCourses.length > 0 ? (
        <CoursesGrid 
          courses={filteredCourses} 
          onCourseDeleted={handleCourseDeleted} 
          onCourseUpdated={handleCourseUpdated}
        />
      ) : (
        <CoursesEmptyState onCreateClick={handleCreateClick} />
      )}
    </div>
  );
};

export default Courses;
