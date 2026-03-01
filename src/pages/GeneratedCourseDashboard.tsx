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
      {/* Clean white background */}
      <div 
        className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white"
      />
      
      {/* Hero Card Section */}
      <div className="relative z-10 mb-16 px-4 sm:px-6">
        <div 
          className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4"
          style={{ minHeight: '340px' }}
        >
          {/* Solid Content Panel — smaller portion */}
          <div className="flex flex-col justify-between p-4 sm:w-[36%] shrink-0">
            <div>
              <p className="text-xs font-mono text-[#8a7a5a] mb-4 tracking-wide uppercase">
                AI-Powered Learning
              </p>
              <div className="flex items-start gap-3 mb-4">
                <GraduationCap className="h-8 w-8 text-[#7a6a2a] mt-1 shrink-0" />
                <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">
                  Course Engine
                </h1>
              </div>
              <p className="text-sm text-[#5a5040] leading-relaxed">
                Generate personalized courses on any topic with AI-powered learning paths
              </p>
            </div>
            <div className="mt-8">
              <Button 
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-6 py-5 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition-all font-semibold"
              >
                <Plus className="h-5 w-5" />
                Create Your Course
              </Button>
            </div>
          </div>

          {/* Image Panel — enveloped inside the card */}
          <div 
            className="flex-1 rounded-xl bg-cover bg-center min-h-[220px] sm:min-h-0"
            style={{
              backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-mart-production-7718665.jpg')",
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">

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
            <Button onClick={() => setShowWizard(true)} size="lg" className="rounded-full">
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Course
            </Button>
          </PremiumCard>
        ) : (
          <div className="space-y-10">
            {/* Active Courses */}
            {activeCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-black mb-6">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="text-lg font-medium text-black mb-6">In Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <h2 className="text-lg font-medium text-black mb-6">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
