import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Brain, Briefcase, ArrowRight, ArrowLeft,
  Sparkles, Search, ChevronRight, Clock, Target, Gauge,
  Check, Settings, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";
import { CourseLevel, FormatPreferences } from "@/types/course-engine";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { toast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActionType = "course" | "assessment" | "interview" | null;
type WizardStep = number; // 0 = not started

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractFirstName(user: { user_metadata?: Record<string, string>; email?: string } | null): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const raw = meta.full_name?.trim().split(/\s+/)[0] || meta.given_name?.trim() || meta.name?.trim().split(/\s+/)[0] || "";
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  return "";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Action Card ────────────────────────────────────────────────────────────

const ACTION_CARDS = [
  {
    type: "course" as const,
    icon: BookOpen,
    title: "Create a Course",
    description: "Generate a personalized learning path on any topic",
    gradient: "from-amber-50 to-orange-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200/60",
    hoverBorder: "hover:border-amber-300",
  },
  {
    type: "assessment" as const,
    icon: Brain,
    title: "Skill Assessment",
    description: "Measure your skills against industry standards",
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200/60",
    hoverBorder: "hover:border-blue-300",
  },
  {
    type: "interview" as const,
    icon: Briefcase,
    title: "Mock Interview",
    description: "Practice realistic AI-powered job interviews",
    gradient: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200/60",
    hoverBorder: "hover:border-emerald-300",
  },
];

// ─── Horizontal Scroll Section ──────────────────────────────────────────────

function ActiveItemsRow({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: ActivityItem[];
  emptyText: string;
}) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length} active</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(item.href)}
            className="flex-shrink-0 w-[260px] snap-start bg-card border border-border/60 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-border transition-all duration-200"
          >
            <p className="text-sm font-medium text-foreground truncate mb-1">{item.title}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {item.meta || item.type} · {timeAgo(item.timestamp)}
            </p>
            {item.type === "Course" && item.progress !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                  {item.progress}%
                </span>
              </div>
            )}
            {item.type === "Assessment" && item.score !== undefined && (
              <span className="text-xs font-semibold text-blue-600">{item.score}%</span>
            )}
            {item.type === "Interview" && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                item.completed ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
              }`}>
                {item.completed ? "Completed" : "In Progress"}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Course Wizard (inline) ─────────────────────────────────────────────────

function InlineCourseWizard({ onBack, initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  const { createCourse } = useGeneratedCourses();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState(initialTopic);
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [paceWeeks, setPaceWeeks] = useState(4);
  const [formatPreferences] = useState<FormatPreferences>({
    historyHeavy: false, scenarioHeavy: false, quizHeavy: false, writingHeavy: false, documentary: false,
  });

  const totalSteps = 3;

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const result = await createCourse({ topic, goal: goal || undefined, level, pace_weeks: paceWeeks, format_preferences: formatPreferences });
      if (result?.course) {
        toast({ title: "Course created!", description: "Redirecting to your new course..." });
        navigate(`/courses/generated/${result.course.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const levels: { value: CourseLevel; label: string; desc: string }[] = [
    { value: "beginner", label: "Beginner", desc: "New to this topic" },
    { value: "intermediate", label: "Intermediate", desc: "Some experience" },
    { value: "advanced", label: "Advanced", desc: "Deep knowledge" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Create Your Course
          </h2>
          <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-amber-500 rounded-full"
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  What do you want to learn?
                </label>
                <Input
                  placeholder="e.g., American History, Python, Finance..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-base bg-card border-border"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Learning goal <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  placeholder="e.g., Understand causes of the Civil War..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  className="bg-card border-border resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  Experience Level
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {levels.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        level === l.value
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        level === l.value ? "border-amber-500 bg-amber-500" : "border-muted-foreground/30"
                      }`}>
                        {level === l.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Course Pace
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 4, 8].map((w) => (
                    <button
                      key={w}
                      onClick={() => setPaceWeeks(w)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paceWeeks === w
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <p className="text-lg font-semibold text-foreground">{w}</p>
                      <p className="text-xs text-muted-foreground">weeks</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</p>
                <p className="text-sm text-foreground"><span className="font-medium">Topic:</span> {topic}</p>
                <p className="text-sm text-foreground"><span className="font-medium">Level:</span> {level}</p>
                <p className="text-sm text-foreground"><span className="font-medium">Pace:</span> {paceWeeks} weeks</p>
                {goal && <p className="text-sm text-foreground"><span className="font-medium">Goal:</span> {goal}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && topic.trim().length < 3}
            className="rounded-full bg-[#091747] hover:bg-[#0d2060] text-white"
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isCreating}
            className="rounded-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            {isCreating ? "Creating..." : "Generate Course"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Assessment Quick Start ─────────────────────────────────────────────────

function InlineAssessmentWizard({ onBack, initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Skill Assessment
        </h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to test your skills?</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {initialTopic
            ? `We'll create an assessment for "${initialTopic}".`
            : "Choose from available assessments or create a custom one."}
        </p>
        <Button
          onClick={() => navigate("/assessments")}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Go to Assessments <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Interview Quick Start ──────────────────────────────────────────────────

function InlineInterviewWizard({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-emerald-500" />
          Mock Interview
        </h2>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Practice makes perfect</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Set up a mock interview tailored to your target role and industry.
        </p>
        <Button
          onClick={() => navigate("/assessments/job-interview-simulator")}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Start Interview <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function HubPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const { items: recentActivity, isLoading } = useRecentActivity(10);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setFirstName(extractFirstName(data.user as Parameters<typeof extractFirstName>[0]));
    });
  }, []);

  const courseItems = recentActivity.filter((i) => i.type === "Course");
  const assessmentItems = recentActivity.filter((i) => i.type === "Assessment");
  const interviewItems = recentActivity.filter((i) => i.type === "Interview");

  const handleActionSelect = (type: ActionType) => {
    setActiveAction(type);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim().length >= 3) {
      setActiveAction("course");
    }
  };

  // ─── Wizard Takeover ────────────────────────────────────────────────
  if (activeAction) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="max-w-lg mx-auto px-4 py-6 h-[100dvh] flex flex-col">
          <AnimatePresence mode="wait">
            {activeAction === "course" && (
              <InlineCourseWizard
                key="course"
                onBack={() => setActiveAction(null)}
                initialTopic={searchValue}
              />
            )}
            {activeAction === "assessment" && (
              <InlineAssessmentWizard
                key="assessment"
                onBack={() => setActiveAction(null)}
                initialTopic={searchValue}
              />
            )}
            {activeAction === "interview" && (
              <InlineInterviewWizard
                key="interview"
                onBack={() => setActiveAction(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Home View ──────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-16 pb-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-1">
            {firstName ? `Hey ${firstName}, what's next?` : "What would you like to do?"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Create something new or pick up where you left off.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="What do you want to learn about?"
              className="w-full h-12 sm:h-14 pl-12 pr-4 bg-card border border-border rounded-2xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
            {searchValue.trim().length >= 3 && (
              <button
                onClick={handleSearchSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="h-4 w-4 text-primary-foreground" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {ACTION_CARDS.map((card) => (
            <motion.button
              key={card.type}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionSelect(card.type)}
              className={`flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border bg-gradient-to-br ${card.gradient} ${card.borderColor} ${card.hoverBorder} transition-all duration-200 text-center`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm`}>
                <card.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.iconColor}`} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">
                {card.title}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Active Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <ActiveItemsRow title="Active Courses" items={courseItems} emptyText="No active courses" />
            <ActiveItemsRow title="Assessments" items={assessmentItems} emptyText="No assessments" />
            <ActiveItemsRow title="Interviews" items={interviewItems} emptyText="No interviews" />

            {courseItems.length === 0 && assessmentItems.length === 0 && interviewItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nothing here yet. Pick an action above to get started!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
