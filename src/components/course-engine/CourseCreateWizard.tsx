import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Gauge,
  Loader2,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import { CourseLevel, FormatPreferences } from "@/types/course-engine";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { cn } from "@/lib/utils";

interface CourseCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  initialTopic?: string;
}

const STEP_LABELS = ["Topic", "Pace", "Format"] as const;

const fieldClass = cn(
  "w-full rounded-xl border border-[#C8A84B]/40 bg-white px-4 py-3 text-sm text-[#1a1a1a]",
  "placeholder:text-[#8a7a5a]/55",
  "shadow-[inset_0_1px_3px_rgba(184,134,11,0.06)]",
  "focus:outline-none focus:border-[#C8A84B]/80 focus:ring-1 focus:ring-[#C8A84B]/40",
  "disabled:opacity-50 transition-all duration-200"
);

const goldCta = cn(
  "inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold text-white",
  "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
  "shadow-[0_6px_20px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
  "hover:from-[#E4B333] hover:to-[#C99416]",
  "hover:shadow-[0_10px_24px_-8px_rgba(184,134,11,0.65)]",
  "hover:-translate-y-0.5 transition-all duration-200",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
);

export const CourseCreateWizard = ({
  open,
  onClose,
  onCreated,
  initialTopic,
}: CourseCreateWizardProps) => {
  const { createCourse } = useGeneratedCourses();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(initialTopic || "");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [paceWeeks, setPaceWeeks] = useState(4);
  const [formatPreferences, setFormatPreferences] = useState<FormatPreferences>({
    historyHeavy: false,
    scenarioHeavy: false,
    quizHeavy: false,
    writingHeavy: false,
    documentary: false,
  });

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const result = await createCourse({
        topic,
        goal: goal || undefined,
        level,
        pace_weeks: paceWeeks,
        format_preferences: formatPreferences,
      });
      if (result) {
        handleClose();
        onCreated?.();
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setStep(1);
      setTopic("");
      setGoal("");
      setLevel("beginner");
      setPaceWeeks(4);
      setFormatPreferences({
        historyHeavy: false,
        scenarioHeavy: false,
        quizHeavy: false,
        writingHeavy: false,
        documentary: false,
      });
      onClose();
    }
  };

  const canProceed = step === 1 ? topic.trim().length >= 3 : true;

  const stepVariants = {
    enter: { opacity: 0, x: 16 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden",
          "border border-[#C8A84B]/50",
          "bg-gradient-to-b from-[#FBF7EF] to-white",
          "shadow-[0_24px_64px_-16px_rgba(184,134,11,0.22),0_8px_32px_-8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]",
          "max-h-[90vh] overflow-y-auto",
          "[&>button]:top-4 [&>button]:right-4 [&>button]:text-[#8a7a5a] [&>button:hover]:text-[#1a1a1a]"
        )}
      >
        {/* Top gold hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/70 to-transparent" />

        <div className="px-6 sm:px-8 pt-8 pb-7 space-y-7">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-[#9a7f2a]">
                AI-Powered Learning
              </span>
              <span className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-[#C8A84B]/60 to-transparent" />
            </div>
            <h2 className="font-manrope text-xl font-medium tracking-tight text-[#1a1a1a]">
              Create Your Course
            </h2>
            <p className="mt-1 text-[13px] text-[#8a7a5a]">
              {step === 1
                ? "What would you like to learn?"
                : step === 2
                ? "Set your level and duration"
                : "Shape the course format"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isComplete = step > stepNum;
              const isActive = step === stepNum;
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200",
                        isComplete
                          ? "bg-gradient-to-br from-[#DAA520] to-[#B8860B] text-white shadow-[0_2px_8px_-2px_rgba(184,134,11,0.5)]"
                          : isActive
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-[#C8A84B]/15 text-[#9a7f2a]"
                      )}
                    >
                      {isComplete ? <Check className="w-3 h-3" /> : `0${stepNum}`}
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-mono uppercase tracking-[0.22em]",
                        isActive ? "text-[#1a1a1a] font-semibold" : "text-[#9a7f2a]/60"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={cn(
                        "h-px w-10 mx-2 mb-5 transition-colors duration-300",
                        step > stepNum ? "bg-gradient-to-r from-[#DAA520] to-[#B8860B]" : "bg-[#C8A84B]/20"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label htmlFor="topic" className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={1.8} />
                    What do you want to learn?
                  </label>
                  <input
                    id="topic"
                    type="text"
                    placeholder="e.g., American History, Data Literacy, Spanish…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isCreating}
                    className={fieldClass}
                    autoFocus
                  />
                  <p className="text-[11px] text-[#8a7a5a]/80">
                    Enter any topic you're interested in learning
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="goal" className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    <Target className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Learning Goal{" "}
                    <span className="text-[#9a7f2a]/50 font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="goal"
                    placeholder="e.g., I want to understand the causes of the Civil War…"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={isCreating}
                    rows={3}
                    className={cn(fieldClass, "resize-none")}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="space-y-7"
              >
                {/* Level */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    <Gauge className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Experience Level
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: "beginner", label: "Beginner", desc: "Start from scratch" },
                        { value: "intermediate", label: "Intermediate", desc: "Build on knowledge" },
                        { value: "advanced", label: "Advanced", desc: "Deep dive" },
                      ] as const
                    ).map((option) => {
                      const active = level === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={isCreating}
                          onClick={() => setLevel(option.value)}
                          className={cn(
                            "flex-1 rounded-xl border px-3 py-3 text-left transition-all duration-150",
                            active
                              ? "border-[#C8A84B]/70 bg-[#FBF7EF] shadow-[0_2px_10px_-4px_rgba(184,134,11,0.3)]"
                              : "border-[#C8A84B]/25 bg-white hover:border-[#C8A84B]/50"
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                active
                                  ? "bg-gradient-to-br from-[#DAA520] to-[#B8860B]"
                                  : "bg-[#C8A84B]/30"
                              )}
                            />
                            <span
                              className={cn(
                                "text-[11px] font-mono font-semibold uppercase tracking-[0.18em]",
                                active ? "text-[#7a5a10]" : "text-[#9a7f2a]/70"
                              )}
                            >
                              {option.label}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[#8a7a5a]/80">
                            {option.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                      <Settings className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Course Duration
                    </label>
                    <span className="font-manrope text-sm font-medium text-[#1a1a1a] tabular-nums">
                      {paceWeeks} <span className="text-xs text-[#8a7a5a]">weeks</span>
                    </span>
                  </div>
                  <Slider
                    value={[paceWeeks]}
                    onValueChange={(v) => setPaceWeeks(v[0])}
                    min={2}
                    max={8}
                    step={1}
                    disabled={isCreating}
                    className="py-1"
                  />
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-[#8a7a5a]/70">
                    <span>2 wks — Quick</span>
                    <span>8 wks — Comprehensive</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  {[
                    { key: "documentary", label: "Documentary Style", desc: "Cinematic narrative framing with contextual immersion" },
                    { key: "historyHeavy", label: "History & Context Heavy", desc: "Deep background and historical context" },
                    { key: "scenarioHeavy", label: "Scenario-Based", desc: "Real-world scenarios and case studies" },
                    { key: "quizHeavy", label: "Quiz-Heavy", desc: "Frequent knowledge checks" },
                    { key: "writingHeavy", label: "Writing-Heavy", desc: "More written reflections and essays" },
                  ].map((option) => {
                    const checked = formatPreferences[option.key as keyof FormatPreferences];
                    return (
                      <div
                        key={option.key}
                        onClick={() =>
                          !isCreating &&
                          setFormatPreferences((prev) => ({
                            ...prev,
                            [option.key]: !prev[option.key as keyof FormatPreferences],
                          }))
                        }
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150",
                          checked
                            ? "border-[#C8A84B]/60 bg-[#FBF7EF] shadow-[0_2px_8px_-4px_rgba(184,134,11,0.25)]"
                            : "border-[#C8A84B]/25 bg-white hover:border-[#C8A84B]/45"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors duration-150",
                            checked
                              ? "bg-gradient-to-br from-[#DAA520] to-[#B8860B] border-[#B8860B]"
                              : "border-[#C8A84B]/40 bg-white"
                          )}
                        >
                          {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                        </div>
                        <div>
                          <span
                            className={cn(
                              "text-[13px] font-medium leading-tight",
                              checked ? "text-[#5a3a08]" : "text-[#1a1a1a]"
                            )}
                          >
                            {option.label}
                          </span>
                          <p className="text-[11px] text-[#8a7a5a]/80 mt-0.5">{option.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary strip */}
                <div className="rounded-xl border border-[#C8A84B]/30 bg-[#FBF7EF]/60 p-4">
                  <h4 className="text-[9px] font-mono font-semibold uppercase tracking-[0.28em] text-[#9a7f2a] mb-3">
                    Course Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Topic", value: topic || "—" },
                      { label: "Level", value: level.charAt(0).toUpperCase() + level.slice(1) },
                      { label: "Duration", value: `${paceWeeks} wks` },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#8a7a5a] mb-0.5">
                          {item.label}
                        </div>
                        <div className="font-manrope text-sm font-medium text-[#1a1a1a] truncate">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
              disabled={isCreating}
              className="group flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-[0.18em] text-[#8a7a5a] hover:text-[#1a1a1a] disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed || isCreating}
                className={goldCta}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className={goldCta}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Course
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
