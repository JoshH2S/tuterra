import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookMarked, Compass, Home, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CourseModule, GeneratedCourse } from "@/types/course-engine";
import { cn } from "@/lib/utils";

interface CourseCompletionScreenProps {
  course: GeneratedCourse;
  modules: CourseModule[];
  totalStepsCompleted: number;
  totalStepsInCourse: number;
  onBackToCourse: () => void;
  onBackToCourses: () => void;
}

interface SubmissionRow {
  step_id: string;
  score: number | null;
  is_passing: boolean | null;
  created_at: string;
  module_steps: {
    module_id: string;
    step_type: string;
    title: string | null;
  } | null;
}

interface ModuleStats {
  module: CourseModule;
  avgScore: number | null;
  submissionCount: number;
  checkpointScore: number | null;
}

export function CourseCompletionScreen({
  course,
  modules,
  totalStepsCompleted,
  totalStepsInCourse,
  onBackToCourse,
  onBackToCourses,
}: CourseCompletionScreenProps) {
  const [submissions, setSubmissions] = useState<SubmissionRow[] | null>(null);
  const [displayOverall, setDisplayOverall] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('step_submissions')
        .select('step_id, score, is_passing, created_at, module_steps!inner(module_id, step_type, title)')
        .eq('course_id', course.id)
        .order('attempt_number', { ascending: false });

      if (cancelled) return;
      setSubmissions((data as unknown as SubmissionRow[]) || []);
    })();
    return () => { cancelled = true; };
  }, [course.id]);

  // Keep only the latest attempt per step
  const latestPerStep = useMemo(() => {
    if (!submissions) return null;
    const bestByStep = new Map<string, SubmissionRow>();
    for (const s of submissions) {
      if (!bestByStep.has(s.step_id)) bestByStep.set(s.step_id, s);
    }
    return Array.from(bestByStep.values());
  }, [submissions]);

  const overallStats = useMemo(() => {
    if (!latestPerStep) return null;
    const scored = latestPerStep.filter(s => typeof s.score === 'number') as Array<SubmissionRow & { score: number }>;
    const checkpoints = scored.filter(s => s.module_steps?.step_type === 'checkpoint');

    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)
      : null;

    const checkpointAvg = checkpoints.length > 0
      ? Math.round(checkpoints.reduce((a, b) => a + b.score, 0) / checkpoints.length)
      : null;

    const submissionsCount = latestPerStep.length;

    return { avgScore, checkpointAvg, submissionsCount, checkpointsCompleted: checkpoints.length };
  }, [latestPerStep]);

  const moduleStats = useMemo<ModuleStats[]>(() => {
    if (!latestPerStep) return [];
    return modules.map(module => {
      const ofThisModule = latestPerStep.filter(s => s.module_steps?.module_id === module.id);
      const scored = ofThisModule.filter(s => typeof s.score === 'number') as Array<SubmissionRow & { score: number }>;
      const checkpoint = scored.find(s => s.module_steps?.step_type === 'checkpoint');

      return {
        module,
        submissionCount: ofThisModule.length,
        avgScore: scored.length > 0
          ? Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)
          : null,
        checkpointScore: checkpoint ? checkpoint.score : null,
      };
    });
  }, [latestPerStep, modules]);

  // Animate the overall score counter
  const target = overallStats?.avgScore ?? 0;
  useEffect(() => {
    if (target === 0) return;
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayOverall(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // Ring geometry
  const size = 208;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, target));
  const dashOffset = circumference - (progress / 100) * circumference;

  const scoreLabel = (() => {
    if (!overallStats) return 'Reviewing your work';
    if (target >= 90) return 'Distinction';
    if (target >= 80) return 'Strong performance';
    if (target >= 70) return 'Solid command';
    if (target >= 60) return 'Good foundation';
    return 'Completed with effort';
  })();

  const completedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalMinutes = modules.reduce((a, m) => a + (m.estimated_minutes || 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-300/40 bg-gradient-to-b from-brand-light to-white px-6 py-10 text-center shadow-[0_8px_32px_-8px_rgba(184,134,11,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent" />

        {/* Eyebrow */}
        <div className="mx-auto mb-6 flex max-w-xs items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-l from-primary-300/60 to-transparent" />
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-600">
            <Trophy className="h-3 w-3" />
            Course Completed
          </div>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-300/60 to-transparent" />
        </div>

        {/* Score ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(45, 40%, 90%)" strokeWidth={strokeWidth} fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#completionGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {overallStats && target > 0 ? (
              <>
                <span className="font-manrope text-6xl font-semibold tracking-tight text-primary-700 tabular-nums">
                  {displayOverall}
                  <span className="ml-0.5 text-3xl text-primary-500">%</span>
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-primary-600/80">
                  Overall score
                </span>
              </>
            ) : (
              <Sparkles className="h-10 w-10 text-primary-500" />
            )}
          </div>
        </div>

        <p className="mt-7 font-manrope text-2xl font-medium text-primary-900">{scoreLabel}</p>

        <h1 className="mt-3 font-manrope text-xl font-medium leading-snug text-neutral-text">
          {course.title}
        </h1>

        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-neutral-muted">
          Completed on {completedOn}
        </p>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <StatBlock
          label="Steps completed"
          value={`${totalStepsCompleted}`}
          sub={`of ${totalStepsInCourse}`}
        />
        <StatBlock
          label="Checkpoints passed"
          value={`${overallStats?.checkpointsCompleted ?? 0}`}
          sub={`of ${modules.length}`}
        />
        <StatBlock
          label="Checkpoint avg"
          value={overallStats?.checkpointAvg != null ? `${overallStats.checkpointAvg}%` : '—'}
        />
        <StatBlock
          label="Time invested"
          value={`~${totalMinutes}`}
          sub="minutes"
        />
      </div>

      {/* Per-module breakdown */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookMarked className="h-3.5 w-3.5 text-primary-600" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            Module by module
          </h2>
        </div>

        <div className="divide-y divide-primary-300/30 border-y border-primary-300/30">
          {moduleStats.map(({ module, avgScore, checkpointScore, submissionCount }, i) => (
            <div key={module.id} className="flex items-start gap-4 py-4">
              <span className="font-manrope text-2xl font-semibold text-primary-500/80 tabular-nums shrink-0 w-10 text-right">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-manrope text-base font-medium text-primary-900 leading-snug">
                  {module.title}
                </h3>
                {module.summary && (
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-muted line-clamp-2">
                    {module.summary}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-neutral-muted">
                  <span>{submissionCount} submission{submissionCount === 1 ? '' : 's'}</span>
                  {avgScore != null && <span>Avg {avgScore}%</span>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {checkpointScore != null ? (
                  <>
                    <span
                      className={cn(
                        "font-manrope text-2xl font-semibold tabular-nums",
                        checkpointScore >= 80
                          ? "text-primary-700"
                          : checkpointScore >= 60
                          ? "text-primary-600"
                          : "text-secondary-600"
                      )}
                    >
                      {checkpointScore}%
                    </span>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-muted/80 mt-0.5">
                      Checkpoint
                    </p>
                  </>
                ) : (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-muted/60">
                    No score
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's next */}
      <section className="rounded-xl border border-primary-300/30 bg-white/60 p-6">
        <div className="mb-3 flex items-center gap-2">
          <Compass className="h-3.5 w-3.5 text-primary-600" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-700">
            What's next
          </h2>
        </div>
        <p className="text-base leading-relaxed text-neutral-text">
          You've completed every module in <span className="text-primary-900">{course.title}</span>.
          Revisit any module to deepen your understanding, or return to your course library to continue your learning path.
        </p>
      </section>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4">
        <Button
          onClick={onBackToCourse}
          size="lg"
          variant="outline"
          className="min-w-[200px] border-primary-300 text-primary-700 hover:bg-brand-light hover:text-primary-800"
        >
          Review Course
        </Button>
        <Button
          onClick={onBackToCourses}
          size="lg"
          className={cn(
            "min-w-[200px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
            "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
            "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
            "transition-all duration-200"
          )}
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Courses
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-primary-300/30 bg-white/60 px-4 py-5 text-center">
      <span className="font-manrope text-2xl font-semibold tabular-nums text-primary-800">
        {value}
      </span>
      {sub && (
        <span className="text-xs text-neutral-muted ml-1">
          {sub}
        </span>
      )}
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-muted">
        {label}
      </p>
    </div>
  );
}
