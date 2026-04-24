import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Play,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourseRunner } from "@/hooks/useCourseRunner";
import { CourseContractScreen } from "@/components/course-engine/CourseContractScreen";
import { cn } from "@/lib/utils";

const GeneratedCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showContract, setShowContract] = useState(false);
  const {
    course,
    modules,
    progress,
    isLoading,
    loadCourse,
    getProgressPercentage,
  } = useCourseRunner();

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id, loadCourse]);

  const handleStartCourse = () => {
    setShowContract(true);
  };

  const handleAcceptContract = async (_startDate: Date) => {
    if (id) {
      navigate(`/courses/generated/${id}/learn`);
    }
  };

  const handleCancelContract = () => {
    setShowContract(false);
  };

  const handleContinue = () => {
    if (id) {
      navigate(`/courses/generated/${id}/learn`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-primary-300/40 bg-white p-10 text-center shadow-[0_8px_32px_-8px_rgba(184,134,11,0.15)]">
          <h2 className="font-manrope text-xl text-primary-900 mb-2">Course not found</h2>
          <p className="text-sm text-neutral-muted mb-6">
            This course may have been deleted or you don't have access.
          </p>
          <Button
            onClick={() => navigate('/courses/generated')}
            className="bg-gradient-to-br from-primary-400 to-primary-600 text-white hover:from-primary-500 hover:to-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (showContract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CourseContractScreen
          course={course}
          modules={modules}
          onAcceptContract={handleAcceptContract}
          onCancel={handleCancelContract}
        />
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const hasStarted = progress && progress.total_steps_completed > 0;
  const isComplete = Boolean(progress?.completed_at) || progressPercent >= 100;

  // Determine which modules are locked (beyond current reach)
  let highestReachedIndex = 0;
  modules.forEach((module) => {
    if (module.is_completed || progress?.current_module_id === module.id) {
      highestReachedIndex = Math.max(highestReachedIndex, module.module_index);
    }
  });

  const totalMinutes = modules.reduce((a, m) => a + (m.estimated_minutes || 0), 0);

  // Ring geometry
  const ringSize = 112;
  const ringStroke = 7;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light/50 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/courses/generated')}
          className="group mb-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Courses
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-primary-300/40 bg-gradient-to-b from-brand-light to-white px-6 py-10 sm:px-12 sm:py-14 shadow-[0_8px_32px_-8px_rgba(184,134,11,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent" />

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-600">
              <Sparkles className="h-3 w-3" />
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Course
            </div>
            <span className="h-px flex-1 max-w-[140px] bg-gradient-to-r from-primary-300/60 to-transparent" />
          </div>

          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <h1 className="font-manrope text-3xl sm:text-4xl font-medium leading-[1.15] tracking-tight text-primary-900">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-4 text-base leading-relaxed text-neutral-text max-w-xl">
                  {course.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-muted">
                <span className="tabular-nums">
                  {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                </span>
                <span className="h-1 w-1 rounded-full bg-primary-300" />
                <span className="flex items-center gap-1.5 tabular-nums">
                  <Clock className="h-3 w-3" />
                  ~{totalMinutes} min
                </span>
                <span className="h-1 w-1 rounded-full bg-primary-300" />
                <span className="tabular-nums">
                  {course.pace_weeks} {course.pace_weeks === 1 ? 'week' : 'weeks'}
                </span>
              </div>

              <div className="mt-8">
                {isComplete ? (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className={cn(
                      "bg-gradient-to-br from-primary-400 to-primary-600 text-white",
                      "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
                      "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
                      "transition-all duration-200"
                    )}
                  >
                    View Completion
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : hasStarted ? (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className={cn(
                      "bg-gradient-to-br from-primary-400 to-primary-600 text-white",
                      "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
                      "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
                      "transition-all duration-200"
                    )}
                  >
                    Continue Learning
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartCourse}
                    size="lg"
                    className={cn(
                      "bg-gradient-to-br from-primary-400 to-primary-600 text-white",
                      "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
                      "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
                      "transition-all duration-200"
                    )}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Begin Course
                  </Button>
                )}
              </div>
            </div>

            {/* Ring */}
            {hasStarted && (
              <div className="flex flex-col items-center gap-2 sm:pl-6">
                <div className="relative" style={{ width: ringSize, height: ringSize }}>
                  <svg width={ringSize} height={ringSize} className="-rotate-90">
                    <defs>
                      <linearGradient id="detailRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#DAA520" />
                        <stop offset="100%" stopColor="#B8860B" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="hsl(45, 40%, 90%)"
                      strokeWidth={ringStroke}
                    />
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      fill="none"
                      stroke="url(#detailRingGrad)"
                      strokeWidth={ringStroke}
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-manrope text-2xl font-semibold text-primary-800 tabular-nums">
                      {progressPercent}
                      <span className="text-base text-primary-500">%</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-600">
                  {isComplete ? 'Completed' : 'In Progress'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Learning Objectives */}
        {course.learning_objectives && course.learning_objectives.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-center gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-600">
                What You'll Learn
              </div>
              <span className="h-px flex-1 bg-gradient-to-r from-primary-300/60 to-transparent" />
            </div>
            <ul className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
              {course.learning_objectives.map((objective, index) => (
                <li key={objective.id || index} className="flex items-start gap-3">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
                  <span className="text-[15px] leading-relaxed text-neutral-text">
                    {objective.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Syllabus */}
        <section className="mt-14 mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-600">
              Syllabus
            </div>
            <span className="h-px flex-1 bg-gradient-to-r from-primary-300/60 to-transparent" />
          </div>

          <div className="divide-y divide-primary-300/30 border-y border-primary-300/30">
            {modules.map((module, index) => {
              const moduleProgress = progress?.module_completion?.[module.id];
              const isCompleted = module.is_completed || moduleProgress?.status === 'completed';
              const isInProgress = moduleProgress?.status === 'in_progress' || progress?.current_module_id === module.id;
              const isLocked = module.module_index > highestReachedIndex + 1;

              return (
                <div
                  key={module.id}
                  className={cn(
                    "group flex items-start gap-5 py-5 transition-colors",
                    isLocked && "opacity-50"
                  )}
                >
                  {/* Index / status */}
                  <div className="w-12 shrink-0 pt-1 text-right">
                    {isCompleted ? (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-primary-600" strokeWidth={1.8} />
                    ) : isLocked ? (
                      <Lock className="ml-auto h-4 w-4 text-neutral-muted" strokeWidth={1.8} />
                    ) : (
                      <span className="font-manrope text-2xl font-semibold text-primary-500/80 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-manrope text-base sm:text-lg font-medium text-primary-900 leading-snug">
                        {module.title}
                      </h3>
                      {isInProgress && !isCompleted && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-600">
                          In progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-600">
                          Complete
                        </span>
                      )}
                    </div>

                    {module.summary && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-muted line-clamp-2 max-w-2xl">
                        {module.summary}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-neutral-muted/80">
                      {module.estimated_minutes ? (
                        <span className="flex items-center gap-1.5 tabular-nums">
                          <Clock className="h-3 w-3" />
                          {module.estimated_minutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GeneratedCourseDetail;
