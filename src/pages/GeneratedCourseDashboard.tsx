import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, GraduationCap, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { CourseCreateWizard } from "@/components/course-engine/CourseCreateWizard";
import { GeneratedCourseCard } from "@/components/course-engine/GeneratedCourseCard";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";

const GeneratedCourseDashboard = () => {
  const navigate = useNavigate();
  const { courses, isLoading, refreshCourses, deleteCourse } = useGeneratedCourses();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const activeCourses = courses.filter(c => c.status === 'active');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const draftCourses = courses.filter(c => c.status === 'draft' || c.status === 'generating');

  const handleCourseCreated = () => {
    setShowWizard(false);
    refreshCourses();
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/generated/${courseId}`);
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
          <PremiumCard className="p-12 text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first personalized course on any topic. Our AI will generate
              a complete learning journey with modules, checkpoints, and feedback.
            </p>
            <Button onClick={() => setShowWizard(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Course
            </Button>
          </PremiumCard>
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
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={deleteCourse}
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
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={deleteCourse}
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
                      onClick={() => handleCourseClick(course.id)}
                      onDelete={deleteCourse}
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
