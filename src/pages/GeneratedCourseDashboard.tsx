import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, GraduationCap, Clock, Target, Search, Send, Sparkles, Briefcase, Lightbulb } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { CreateCourseRequest } from "@/types/course-engine";
import { cn } from "@/lib/utils";

const GeneratedCourseDashboard = () => {
  console.log('[GeneratedCourseDashboard] Component rendering...');
  
  const navigate = useNavigate();
  const { courses, isLoading, refreshCourses, deleteCourse, createCourse, isCreating } = useGeneratedCourses();
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "alpha" | "progress">("recent");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "completed" | "draft">("all");
  const [quickStartTopic, setQuickStartTopic] = useState("");

  console.log(`[GeneratedCourseDashboard] State - isLoading: ${isLoading}, courses: ${courses.length}`);

  // Debounce search input
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    console.log(`[GeneratedCourseDashboard] Filtering and sorting ${courses.length} courses...`);
    let filtered = [...courses];

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        course.topic.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      console.log(`[GeneratedCourseDashboard] After search filter: ${filtered.length} courses`);
    }

    // Apply status filter
    if (filterBy !== "all") {
      const beforeCount = filtered.length;
      filtered = filtered.filter(course => {
        if (filterBy === "draft") {
          return course.status === "draft" || course.status === "generating";
        }
        return course.status === filterBy;
      });
      console.log(`[GeneratedCourseDashboard] After status filter (${filterBy}): ${filtered.length}/${beforeCount} courses`);
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

    console.log(`[GeneratedCourseDashboard] After sorting (${sortBy}): ${filtered.length} courses`);
    return filtered;
  }, [courses, debouncedSearchQuery, filterBy, sortBy]);

  const activeCourses = filteredAndSortedCourses.filter(c => c.status === 'active');
  const completedCourses = filteredAndSortedCourses.filter(c => c.status === 'completed');
  const draftCourses = filteredAndSortedCourses.filter(c => c.status === 'draft' || c.status === 'generating');

  console.log(`[GeneratedCourseDashboard] Categories - Active: ${activeCourses.length}, Completed: ${completedCourses.length}, Draft: ${draftCourses.length}`);

  // Fetch courses on mount
  useEffect(() => {
    console.log('[GeneratedCourseDashboard] useEffect triggered - fetching courses...');
    refreshCourses().then(() => {
      console.log('[GeneratedCourseDashboard] refreshCourses completed');
    }).catch((err) => {
      console.error('[GeneratedCourseDashboard] refreshCourses failed:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCourseCreated = () => {
    console.log('[GeneratedCourseDashboard] Course created, refreshing list...');
    setShowWizard(false);
    refreshCourses();
  };

  const handleCourseClick = (courseId: string) => {
    console.log(`[GeneratedCourseDashboard] Navigating to course: ${courseId}`);
    navigate(`/courses/generated/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    console.log(`[GeneratedCourseDashboard] Deleting course: ${courseId}`);
    const success = await deleteCourse(courseId);
    if (success) {
      console.log(`[GeneratedCourseDashboard] Course deleted successfully, refreshing...`);
      await refreshCourses();
    } else {
      console.error(`[GeneratedCourseDashboard] Failed to delete course: ${courseId}`);
    }
    return success;
  };

  const handleQuickStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quickStartTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter what you'd like to learn",
        variant: "destructive",
      });
      return;
    }

    console.log('[GeneratedCourseDashboard] Quick start with topic:', quickStartTopic);

    // Create course with default settings
    const courseData: CreateCourseRequest = {
      topic: quickStartTopic.trim(),
      level: "beginner",
      pace_weeks: 4,
      format_preferences: {
        historyHeavy: false,
        scenarioHeavy: true,
        quizHeavy: true,
        writingHeavy: false,
      }
    };

    const result = await createCourse(courseData);
    
    if (result) {
      console.log('[GeneratedCourseDashboard] Course created, navigating to detail page');
      setQuickStartTopic(""); // Clear input
      navigate(`/courses/generated/${result.course.id}`);
    }
  };

  const popularTopics = [
    { icon: BookOpen, label: "Spanish" },
    { icon: Briefcase, label: "Business" },
    { icon: GraduationCap, label: "Data Science" },
    { icon: Lightbulb, label: "Flying" },
  ];

  return (
    <>
      {/* Background with subtle gradient */}
      <div 
        className="fixed inset-0 left-0 md:left-[200px] -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Quick Start Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#091747] mb-3">
              What would you like to learn?
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Enter any topic below and we'll create a personalized learning experience just for you
            </p>
          </div>

          {/* How It Works Card */}
          <PremiumCard className="p-4 bg-amber-50 border-amber-200 mb-6 max-w-3xl mx-auto">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">How it works:</p>
                <p className="text-sm text-amber-800 mt-1">
                  Tell us what you want to study and we'll instantly create a personalized course. 
                  Try "Flying", "Spanish", "Guitar", or anything else!
                </p>
              </div>
            </div>
          </PremiumCard>

          {/* Quick Start Input */}
          <form onSubmit={handleQuickStart} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g., Flying, Spanish, Web Development"
                value={quickStartTopic}
                onChange={(e) => setQuickStartTopic(e.target.value)}
                disabled={isCreating}
                className="text-lg py-6 pr-12 bg-white/95 backdrop-blur-sm border-2 focus:border-primary"
              />
              <Button
                type="submit"
                disabled={isCreating || !quickStartTopic.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0"
              >
                {isCreating ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Popular Topics */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Popular Topics</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWizard(true)}
                className="text-slate-600 hover:text-slate-900 text-xs"
              >
                Advanced Options
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {popularTopics.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setQuickStartTopic(item.label)}
                    disabled={isCreating}
                    className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-primary/50 transition-all p-3 text-left disabled:opacity-50 shadow-sm"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        {courses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-300"></div>
              <p className="text-slate-600 text-sm font-medium">Your Courses</p>
              <div className="flex-1 h-px bg-slate-300"></div>
            </div>
          </div>
        )}

        {/* Stats and Filters Section */}
        {courses.length > 0 && (
          <>
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </>
        )}

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
