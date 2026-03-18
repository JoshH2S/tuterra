import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MessageSquare, Sparkles, Search,
  BookOpen, Brain, Briefcase, ArrowLeft, Target, Gauge, Clock, Check, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CourseLevel, FormatPreferences } from "@/types/course-engine";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { toast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActionType = "course" | "assessment" | "interview" | null;

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function extractFirstName(user: { user_metadata?: Record<string, string>; email?: string } | null): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const raw =
    meta.full_name?.trim().split(/\s+/)[0] ||
    meta.given_name?.trim() ||
    meta.name?.trim().split(/\s+/)[0] ||
    "";
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  return "";
}

// ─── Action Chips Config ────────────────────────────────────────────────────

const ACTION_CHIPS: { type: ActionType; icon: typeof BookOpen; label: string }[] = [
  { type: "course", icon: BookOpen, label: "Create Course" },
  { type: "assessment", icon: Brain, label: "Assessment" },
  { type: "interview", icon: Briefcase, label: "Interview" },
];

// ─── Feature Card ───────────────────────────────────────────────────────────

interface FeatureCardProps {
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  delay?: number;
}

function FeatureCard({ title, eyebrow, description, cta, href, image, delay = 0 }: FeatureCardProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      onClick={() => navigate(href)}
      className="group rounded-2xl overflow-hidden border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
    >
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest mb-1.5">{eyebrow}</p>
          <h3 className="text-xl font-semibold text-white leading-tight tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="bg-white px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(href); }}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] transition-colors duration-150"
        >
          {cta}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Activity Row ────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ActivityItem["type"], { label: string; dot: string }> = {
  Course:     { label: "Course",     dot: "bg-amber-400" },
  Assessment: { label: "Assessment", dot: "bg-blue-400" },
  Interview:  { label: "Interview",  dot: "bg-slate-400" },
};

function ActivityRow({ item, onClick }: { item: ActivityItem; onClick: () => void }) {
  const styles = TYPE_STYLES[item.type];

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50/60 -mx-6 px-6 transition-colors duration-150"
    >
      <div className="w-8 h-8 rounded-full bg-[#F7F3EC] border border-[#C8A84B]/20 flex items-center justify-center shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {styles.label}
          {item.meta ? ` · ${item.meta}` : ""}
          {" · "}
          {timeAgo(item.timestamp)}
        </p>
      </div>
      {item.type === "Course" && item.progress !== undefined && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#C8A84B]" style={{ width: `${item.progress}%` }} />
          </div>
          <span className="text-xs text-gray-400 font-medium w-8 text-right">{item.progress}%</span>
        </div>
      )}
      {item.type === "Assessment" && item.score !== undefined && (
        <span className="text-xs font-semibold text-blue-600 shrink-0 tabular-nums">
          {item.score}%
        </span>
      )}
      {item.type === "Interview" && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
          item.completed
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}>
          {item.completed ? "Completed" : "In Progress"}
        </span>
      )}
    </div>
  );
}

// ─── Inline Course Wizard ───────────────────────────────────────────────────

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
      className="max-w-lg mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#C8A84B]" />
            Create Your Course
          </h2>
          <p className="text-xs text-gray-400">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-[#C8A84B] rounded-full"
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                What do you want to learn?
              </label>
              <Input
                placeholder="e.g., American History, Python, Finance..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-base"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                Learning goal <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="e.g., Understand causes of the Civil War..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-gray-400" />
                Experience Level
              </label>
              <div className="grid grid-cols-1 gap-2">
                {levels.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      level === l.value
                        ? "border-[#C8A84B] bg-[#F7F3EC] shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      level === l.value ? "border-[#C8A84B] bg-[#C8A84B]" : "border-gray-300"
                    }`}>
                      {level === l.value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.label}</p>
                      <p className="text-xs text-gray-400">{l.desc}</p>
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
              <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Course Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => setPaceWeeks(w)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paceWeeks === w
                        ? "border-[#C8A84B] bg-[#F7F3EC] shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p className="text-lg font-semibold text-gray-900">{w}</p>
                    <p className="text-xs text-gray-400">weeks</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#F7F3EC] rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-[#8a7a5a] uppercase tracking-wider">Summary</p>
              <p className="text-sm text-gray-900"><span className="font-medium">Topic:</span> {topic}</p>
              <p className="text-sm text-gray-900"><span className="font-medium">Level:</span> {level}</p>
              <p className="text-sm text-gray-900"><span className="font-medium">Pace:</span> {paceWeeks} weeks</p>
              {goal && <p className="text-sm text-gray-900"><span className="font-medium">Goal:</span> {goal}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-100">
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
            className="rounded-full bg-[#C8A84B] hover:bg-[#b89a3d] text-white"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
            {isCreating ? "Creating..." : "Generate Course"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Inline Assessment Wizard ───────────────────────────────────────────────

function InlineAssessmentWizard({ onBack, initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto py-8 px-4 text-center"
    >
      <div className="flex items-center gap-3 mb-6 text-left">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Skill Assessment
        </h2>
      </div>
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 mx-auto">
        <Brain className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to test your skills?</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
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
    </motion.div>
  );
}

// ─── Inline Interview Wizard ────────────────────────────────────────────────

function InlineInterviewWizard({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto py-8 px-4 text-center"
    >
      <div className="flex items-center gap-3 mb-6 text-left">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-emerald-500" />
          Mock Interview
        </h2>
      </div>
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 mx-auto">
        <Briefcase className="h-8 w-8 text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice makes perfect</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
        Simulate realistic job interviews with AI feedback.
      </p>
      <Button
        onClick={() => navigate("/assessments/job-interview-simulator")}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Start Interview <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [inputTopic, setInputTopic] = useState("");
  const [activeWizard, setActiveWizard] = useState<ActionType>(null);
  const { items: recentActivity, isLoading } = useRecentActivity(3);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setFirstName(extractFirstName(data.user as Parameters<typeof extractFirstName>[0]));
    });
  }, []);

  const handleInputSubmit = () => {
    if (inputTopic.trim().length >= 3) {
      setActiveWizard("course");
    }
  };

  const handleChipClick = (type: ActionType) => {
    setActiveWizard(type);
  };

  const handleWizardBack = () => {
    setActiveWizard(null);
  };

  const features: FeatureCardProps[] = [
    {
      title: "AI Courses",
      eyebrow: "AI-Powered Learning",
      description: "Generate personalized learning paths on any topic.",
      cta: "Create Course",
      href: "/courses/generated",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-mart-production-7718665.jpg",
      delay: 0.15,
    },
    {
      title: "Skill Assessments",
      eyebrow: "Professional Growth",
      description: "Measure your skills against what employers expect.",
      cta: "Take Assessment",
      href: "/assessments",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/skillassessment2.jpg",
      delay: 0.22,
    },
    {
      title: "Interview Simulator",
      eyebrow: "Career Preparation",
      description: "Practice realistic AI-powered job interviews.",
      cta: "Start Simulation",
      href: "/assessments/job-interview-simulator",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/jobinterviewsimulator.jpg",
      delay: 0.29,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white" />

      <AnimatePresence mode="wait">
        {activeWizard ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 min-h-[60vh]"
          >
            {activeWizard === "course" && (
              <InlineCourseWizard onBack={handleWizardBack} initialTopic={inputTopic} />
            )}
            {activeWizard === "assessment" && (
              <InlineAssessmentWizard onBack={handleWizardBack} initialTopic={inputTopic} />
            )}
            {activeWizard === "interview" && (
              <InlineInterviewWizard onBack={handleWizardBack} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* ── Hero Card with Input ──────────────────────────────── */}
            <div className="relative z-10 mb-12 px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] overflow-hidden"
                style={{ minHeight: "300px" }}
              >
                {/* Mobile: full-bleed background image */}
                <div
                  className="sm:hidden absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-donghuangmingde-2177482.jpg')",
                  }}
                />
                <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                {/* Layout */}
                <div className="relative z-10 flex flex-col sm:flex-row h-full sm:bg-[#F7F3EC]">
                  {/* Text + Input Panel */}
                  <div className="flex flex-col justify-end sm:justify-between p-6 sm:p-6 sm:w-[45%] shrink-0 min-h-[340px] sm:min-h-0">
                    <div>
                      <p className="text-[10px] font-mono text-white/70 sm:text-[#8a7a5a] mb-3 tracking-wide uppercase">
                        Your learning studio
                      </p>
                      <div className="flex items-start gap-3 mb-3">
                        <Sparkles className="h-6 w-6 text-white/80 sm:text-[#7a6a2a] mt-1 shrink-0" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium font-manrope text-white sm:text-[#1a1a1a] leading-tight tracking-tight">
                          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
                        </h1>
                      </div>
                      <p className="text-sm text-white/70 sm:text-[#5a5040] leading-relaxed max-w-xs mb-5">
                        Pick up where you left off, or start something new.
                      </p>

                      {/* Search Input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 sm:text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="What do you want to learn today?"
                          value={inputTopic}
                          onChange={(e) => setInputTopic(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
                          className="w-full h-11 pl-10 pr-4 rounded-full text-sm
                            bg-white/15 backdrop-blur-sm text-white placeholder-white/50 border border-white/20
                            sm:bg-white sm:text-gray-900 sm:placeholder-gray-400 sm:border-gray-200 sm:shadow-sm
                            focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/40 transition-all duration-200"
                        />
                      </div>

                      {/* Action Chips */}
                      <div className="flex flex-wrap gap-2">
                        {ACTION_CHIPS.map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => handleChipClick(type)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                              bg-white/15 text-white/90 border border-white/20 hover:bg-white/25
                              sm:bg-[#091747] sm:text-white sm:border-transparent sm:hover:bg-[#0d2060]
                              transition-all duration-150 active:scale-95"
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Desktop-only: side image */}
                  <div
                    className="hidden sm:block flex-1 rounded-xl m-4 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-donghuangmingde-2177482.jpg')",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* ── Body ──────────────────────────────────────────────── */}
            <div className="container mx-auto px-4 relative z-10">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {features.map((f) => (
                  <FeatureCard key={f.href} {...f} />
                ))}
              </section>

              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.36, ease: "easeOut" }}
              >
                <div className="bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] px-6 py-5">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Recent Activity</h2>
                    <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150">
                      View all
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4 pt-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-gray-100" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-2.5 bg-gray-100 rounded w-1/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div>
                      {recentActivity.map((item) => (
                        <ActivityRow key={item.id} item={item} onClick={() => navigate(item.href)} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="w-9 h-9 rounded-full bg-[#F7F3EC] border border-[#C8A84B]/20 flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-4 h-4 text-[#7a6a2a]" />
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        No activity yet.{" "}
                        <button
                          onClick={() => handleChipClick("course")}
                          className="text-[#091747] underline underline-offset-2 hover:text-[#0d2060] transition-colors duration-150"
                        >
                          Start your first course
                        </button>{" "}
                        or simulation.
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
