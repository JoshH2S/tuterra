import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, GraduationCap, Clock, Target, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { CourseCreateWizard } from "@/components/course-engine/CourseCreateWizard";
import { GeneratedCourseCard } from "@/components/course-engine/GeneratedCourseCard";
import { GeneratedCoursesEmptyState } from "@/components/course-engine/GeneratedCoursesEmptyState";
import { GeneratedCoursesNoResults } from "@/components/course-engine/GeneratedCoursesNoResults";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const GeneratedCourseDashboard = () => {
  const navigate = useNavigate();
  const { courses, isLoading, refreshCourses, deleteCourse } = useGeneratedCourses();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "alpha" | "progress">("recent");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "completed" | "draft">("all");

  // Debounce search input
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...courses];

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.topic.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(course => {
        if (filterBy === "draft") {
          return course.status === "draft" || course.status === "generating";
        }
        return course.status === filterBy;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "progress") {
        const progressA = a.progress || 0;
        const progressB = b.progress || 0;
        return progressB - progressA;
      } else {
        // Recent (default)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [courses, debouncedSearchQuery, filterBy, sortBy]);

  const activeCourses = filteredAndSortedCourses.filter(c => c.status === 'active');
  const completedCourses = filteredAndSortedCourses.filter(c => c.status === 'completed');
  const draftCourses = filteredAndSortedCourses.filter(c => c.status === 'draft' || c.status === 'generating');

  // Fetch courses on mount
  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const handleCourseCreated = () => {
    setShowWizard(false);
    refreshCourses();
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/generated/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const success = await deleteCourse(courseId);
    if (success) {
      await refreshCourses();
    }
    return success;
  };

  return (
    <>
      {/* Full-bleed background layer - respects sidebar */}
      <div 
        className="fixed inset-0 left-0 md:left-[200px] -z-10"
        style={{
          backgroundImage: "url('/images/white-knight.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <GraduationCap className="h-8 w-8" />
                Course Engine
              </h1>
              <p className="text-white/80 mt-2">
                Generate personalized courses on any topic
              </p>
            </div>
            <Button 
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create Course
            </Button>
          </div>

          {/* Search and Filters */}
          {courses.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur-sm"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="alpha">Alphabetical</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter */}
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="bg-white/90 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <PremiumCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{activeCourses.length}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCourses.length}</p>
              </div>
            </div>
          </PremiumCard>
          
          <PremiumCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{draftCourses.length}</p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Course List */}
        {isLoading ? (
          <AdaptiveLoading />
        ) : courses.length === 0 ? (
          <GeneratedCoursesEmptyState onCreateClick={() => setShowWizard(true)} />
        ) : filteredAndSortedCourses.length === 0 ? (
          <GeneratedCoursesNoResults 
            searchQuery={searchQuery}
            onClearFilters={() => {
              setSearchQuery("");
              setFilterBy("all");
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCourses.map((course) => (
                    <GeneratedCourseCard
                      key={course.id}
                      course={course}
                      progress={course.progress || 0}
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Draft/Generating Courses */}
            {draftCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">In Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftCourses.map((course) => (
                    <GeneratedCourseCard
                      key={course.id}
                      course={course}
                      progress={course.progress || 0}
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCourses.map((course) => (
                    <GeneratedCourseCard
                      key={course.id}
                      course={course}
                      progress={course.progress || 0}
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Wizard Modal */}
        <CourseCreateWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onCreated={handleCourseCreated}
        />
      </div>
    </>
  );
};

export default GeneratedCourseDashboard;
