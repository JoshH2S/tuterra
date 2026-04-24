import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { CourseCreateWizard } from "@/components/course-engine/CourseCreateWizard";
import { GeneratedCourseCard } from "@/components/course-engine/GeneratedCourseCard";
import { AdaptiveLoading } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";

const GeneratedCourseDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, isLoading, refreshCourses, deleteCourse } = useGeneratedCourses();
  const locationState = location.state as { topic?: string; autoCreate?: boolean } | null;
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (locationState?.autoCreate) {
      setShowWizard(true);
      // Clear location state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [locationState?.autoCreate]);

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

  const heroImage =
    "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-mart-production-7718665.jpg')";

  const ctaButtonClass = cn(
    "group inline-flex items-center gap-2 px-6 py-5 rounded-full font-semibold text-white",
    "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
    "shadow-[0_8px_24px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "hover:from-[#E4B333] hover:to-[#C99416]",
    "hover:shadow-[0_10px_28px_-8px_rgba(184,134,11,0.65),inset_0_1px_0_rgba(255,255,255,0.3)]",
    "hover:-translate-y-0.5 transition-all duration-200"
  );

  return (
    <>
      {/* Clean white background */}
      <div
        className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white"
      />

      {/* Hero Card Section */}
      <div className="relative z-10 mb-14 px-4 sm:px-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "border border-[#C8A84B]/60",
            "bg-[#F7F3EC]",
            "shadow-[0_8px_32px_-8px_rgba(184,134,11,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
          )}
        >
          {/* Top gold hairline accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/70 to-transparent" />

          {/* Mobile: full-bleed image */}
          <div
            className="sm:hidden absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: heroImage }}
          />
          <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

          {/* Desktop: grid with equal-height columns */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {/* Text column */}
            <div className="flex flex-col justify-end sm:justify-between p-6 sm:p-10 min-h-[340px] sm:min-h-[360px]">
              <div>
                {/* Eyebrow with flanking hairlines */}
                <div className="mb-5 flex items-center gap-3">
                  <p className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/75 sm:text-[#9a7f2a]">
                    AI-Powered Learning
                  </p>
                  <span className="hidden sm:block h-px flex-1 max-w-[120px] bg-gradient-to-r from-[#C8A84B]/60 to-transparent" />
                </div>

                <h1 className="font-manrope text-3xl md:text-[40px] font-medium leading-[1.1] tracking-tight text-white sm:text-[#1a1a1a]">
                  Course Engine
                </h1>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-[#5a5040]">
                  Generate personalized courses on any topic with AI-powered learning paths
                </p>
              </div>

              <div className="mt-8">
                <Button onClick={() => setShowWizard(true)} className={ctaButtonClass}>
                  <Plus className="h-4 w-4" />
                  What do you want to learn?
                </Button>
              </div>
            </div>

            {/* Desktop-only: full-bleed image with gold divider */}
            <div className="relative hidden sm:block">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: heroImage }}
              />
              {/* Gold hairline divider between the two columns */}
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#C8A84B]/50 to-transparent" />
              {/* Subtle vignette so the photo sits into the chrome */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F7F3EC]/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Course List */}
        {isLoading ? (
          <AdaptiveLoading />
        ) : courses.length === 0 ? (
          <div
            className={cn(
              "mx-auto max-w-xl rounded-2xl p-12 text-center",
              "border border-[#C8A84B]/40 bg-gradient-to-b from-[#F7F3EC] to-white",
              "shadow-[0_8px_32px_-8px_rgba(184,134,11,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
            )}
          >
            <div className="mx-auto mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-l from-[#C8A84B]/60 to-transparent" />
              <GraduationCap className="h-5 w-5 text-[#9a7f2a]" />
              <span className="h-px w-10 bg-gradient-to-r from-[#C8A84B]/60 to-transparent" />
            </div>
            <h3 className="font-manrope text-xl font-medium text-[#1a1a1a] mb-2">
              No courses yet
            </h3>
            <p className="text-sm text-[#5a5040] mb-8 max-w-md mx-auto leading-relaxed">
              Create your first personalized course on any topic. Our AI will generate
              a complete learning journey with modules, checkpoints, and feedback.
            </p>
            <Button onClick={() => setShowWizard(true)} size="lg" className={ctaButtonClass}>
              <Plus className="h-4 w-4" />
              Create Your First Course
            </Button>
          </div>
        ) : (
          <div className="space-y-14">
            {activeCourses.length > 0 && (
              <Section title="Continue Learning">
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
              </Section>
            )}

            {draftCourses.length > 0 && (
              <Section title="In Progress">
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
              </Section>
            )}

            {completedCourses.length > 0 && (
              <Section title="Completed">
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
              </Section>
            )}
          </div>
        )}

        <CourseCreateWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onCreated={handleCourseCreated}
          initialTopic={locationState?.topic}
        />
      </div>
    </>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-manrope text-sm font-medium uppercase tracking-[0.22em] text-[#9a7f2a]">
          {title}
        </h2>
        <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/50 to-transparent" />
      </div>
      {children}
    </section>
  );
}

export default GeneratedCourseDashboard;
