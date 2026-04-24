import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedCourse, CourseModule } from "@/types/course-engine";
import { format, addWeeks, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface CourseContractScreenProps {
  course: GeneratedCourse;
  modules: CourseModule[];
  onAcceptContract: (startDate: Date) => void;
  onCancel: () => void;
}

const editorialCard = cn(
  "relative overflow-hidden rounded-2xl",
  "border border-[#C8A84B]/40",
  "bg-gradient-to-b from-[#FBF7EF] to-white",
  "shadow-[0_8px_32px_-8px_rgba(184,134,11,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
);

const goldCtaClass = cn(
  "group inline-flex items-center gap-2 rounded-full px-6 font-semibold text-white",
  "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
  "shadow-[0_8px_24px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
  "hover:from-[#E4B333] hover:to-[#C99416]",
  "hover:shadow-[0_10px_28px_-8px_rgba(184,134,11,0.65),inset_0_1px_0_rgba(255,255,255,0.3)]",
  "hover:-translate-y-0.5 transition-all duration-200"
);

export function CourseContractScreen({
  course,
  modules,
  onAcceptContract,
  onCancel,
}: CourseContractScreenProps) {
  const startDate = new Date();
  const [isAccepting, setIsAccepting] = useState(false);

  const totalMinutes = modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0);
  const sessionsPerWeek = 2;
  const minutesPerSession = Math.max(
    1,
    Math.round(totalMinutes / Math.max(1, course.pace_weeks * sessionsPerWeek))
  );
  const targetCompletionDate = addWeeks(startDate, course.pace_weeks);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemMinutes = totalMinutes % 60;
  const minutesPerWeek = Math.round(totalMinutes / Math.max(1, course.pace_weeks));

  const getSessionSchedule = () => {
    const sessions = [];
    const baseDate = startDate;

    for (let week = 0; week < course.pace_weeks; week++) {
      const session1 = addDays(baseDate, week * 7 + (2 - baseDate.getDay()));
      const session2 = addDays(baseDate, week * 7 + (4 - baseDate.getDay()));
      sessions.push({
        week: week + 1,
        session1: format(session1, "EEE, MMM d"),
        session2: format(session2, "EEE, MMM d"),
        module: modules[week]?.title || `Module ${week + 1}`,
      });
    }
    return sessions;
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAcceptContract(startDate);
    } finally {
      setIsAccepting(false);
    }
  };

  const sessionSchedule = getSessionSchedule();

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6">
      {/* Editorial header */}
      <header className="text-center">
        <div className="mx-auto mb-5 flex max-w-[260px] items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-l from-[#C8A84B]/60 to-transparent" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-[#9a7f2a]">
            Course Agreement
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/60 to-transparent" />
        </div>

        <h1 className="font-manrope text-3xl md:text-[38px] font-medium leading-[1.15] tracking-tight text-[#1a1a1a]">
          Ready to Start Your Learning Journey?
        </h1>
        <p className="mt-3 text-sm text-[#5a5040]/90">
          Let's set up your personalized learning schedule
        </p>
      </header>

      {/* Course Overview */}
      <section className={cn(editorialCard, "p-6 sm:p-8")}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/60 to-transparent" />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#9a7f2a]">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#C8A84B]/60" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a] tabular-nums">
            {course.pace_weeks} {course.pace_weeks === 1 ? "Week" : "Weeks"}
          </span>
        </div>

        <h2 className="font-manrope text-2xl sm:text-[26px] font-medium leading-snug tracking-tight text-[#1a1a1a]">
          {course.title}
        </h2>

        {course.description && (
          <p className="mt-3 text-[14px] leading-relaxed text-[#5a5040]/90 max-w-2xl">
            {course.description}
          </p>
        )}

        {/* Commitment tiles */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile
            icon={<CalendarDays className="h-4 w-4" strokeWidth={1.8} />}
            label="Duration"
            primary={`${course.pace_weeks} ${course.pace_weeks === 1 ? "week" : "weeks"}`}
          />
          <StatTile
            icon={<Clock className="h-4 w-4" strokeWidth={1.8} />}
            label="Time Commitment"
            primary={`${sessionsPerWeek} sessions / week`}
            secondary={`~${minutesPerSession} min each`}
          />
          <StatTile
            icon={<Target className="h-4 w-4" strokeWidth={1.8} />}
            label="Total Learning"
            primary={`${totalHours}h ${totalRemMinutes}m`}
            secondary={`${modules.length} ${modules.length === 1 ? "module" : "modules"}`}
          />
        </div>

        {/* Target completion strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-[#C8A84B]/30 bg-[#FBF7EF]/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#9a7f2a]">
              Starts today
            </span>
          </div>
          <span className="hidden sm:block h-3 w-px bg-[#C8A84B]/40" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#8a7a5a]">
              Target completion
            </span>
            <span className="font-manrope text-sm font-medium text-[#1a1a1a]">
              {format(targetCompletionDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
        </div>
      </section>

      {/* Learning objectives */}
      {course.learning_objectives && course.learning_objectives.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <h3 className="font-manrope text-sm font-medium uppercase tracking-[0.22em] text-[#9a7f2a]">
              By the end of this course
            </h3>
            <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/50 to-transparent" />
          </div>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
            {course.learning_objectives.map((objective, index) => (
              <li key={objective.id || index} className="flex items-start gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B]" />
                <span className="text-[14px] leading-relaxed text-[#1a1a1a]/85">
                  {objective.text}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Schedule preview */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <h3 className="font-manrope text-sm font-medium uppercase tracking-[0.22em] text-[#9a7f2a]">
            Your Learning Schedule
          </h3>
          <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/50 to-transparent" />
        </div>

        <div className="divide-y divide-[#C8A84B]/25 border-y border-[#C8A84B]/25">
          {sessionSchedule.map((week) => (
            <div
              key={week.week}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <span className="font-manrope text-xl font-semibold text-[#9a7f2a] tabular-nums w-10 shrink-0">
                  {String(week.week).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    Week {week.week}
                  </span>
                  <h4 className="font-manrope text-[15px] font-medium leading-snug text-[#1a1a1a] mt-0.5 truncate">
                    {week.module}
                  </h4>
                </div>
              </div>
              <div className="text-[12px] font-mono uppercase tracking-[0.14em] text-[#8a7a5a] sm:text-right shrink-0 tabular-nums pl-14 sm:pl-0">
                {week.session1} <span className="text-[#C8A84B]/70 mx-1">·</span> {week.session2}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[12px] italic text-[#8a7a5a]/90">
          Consistency is key — keep to your scheduled sessions for the best outcomes.
        </p>
      </section>

      {/* Commitment + CTA */}
      <section className={cn(editorialCard, "p-6 sm:p-8")}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/60 to-transparent" />

        <div className="mb-5 flex items-center gap-3">
          <h3 className="font-manrope text-sm font-medium uppercase tracking-[0.22em] text-[#9a7f2a]">
            Course Commitment
          </h3>
          <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/50 to-transparent" />
        </div>

        <ul className="space-y-3">
          <CommitmentRow>
            I understand this is a <strong className="font-medium text-[#1a1a1a]">{course.pace_weeks}-week commitment</strong>.
          </CommitmentRow>
          <CommitmentRow>
            I will dedicate <strong className="font-medium text-[#1a1a1a]">~{minutesPerWeek} minutes per week</strong> to learning.
          </CommitmentRow>
          <CommitmentRow>
            I will attend <strong className="font-medium text-[#1a1a1a]">{sessionsPerWeek} sessions per week</strong> as scheduled.
          </CommitmentRow>
          <CommitmentRow>
            I will complete all modules and assessments to get the full benefit.
          </CommitmentRow>
        </ul>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isAccepting}
            className="group text-[13px] font-medium uppercase tracking-[0.18em] text-[#8a7a5a] hover:text-[#5a4a1a] transition-colors disabled:opacity-50"
          >
            Not Ready Yet
          </button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            size="lg"
            className={goldCtaClass}
          >
            {isAccepting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Starting Course…
              </>
            ) : (
              <>
                Start My Learning Journey
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-xl border border-[#C8A84B]/30 bg-white/70 px-5 py-4">
      <div className="flex items-center gap-2 text-[#9a7f2a] mb-2">
        {icon}
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em]">
          {label}
        </span>
      </div>
      <p className="font-manrope text-[17px] font-medium text-[#1a1a1a] tabular-nums leading-tight">
        {primary}
      </p>
      {secondary && (
        <p className="mt-1 text-[12px] text-[#8a7a5a] tabular-nums">{secondary}</p>
      )}
    </div>
  );
}

function CommitmentRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        className="mt-[2px] h-4 w-4 shrink-0 text-[#B8860B]"
        strokeWidth={1.8}
      />
      <span className="text-[14px] leading-relaxed text-[#5a5040]">
        {children}
      </span>
    </li>
  );
}
