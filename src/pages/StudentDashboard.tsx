import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MessageSquare, Sparkles,
  BookOpen, Brain, Briefcase, ArrowLeft, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";
import { Button } from "@/components/ui/button";

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

// ─── Spotlight Config ───────────────────────────────────────────────────────

const MODES: {
  type: ActionType;
  icon: typeof BookOpen;
  label: string;
  placeholder: string;
  suggestions: string[];
  accent: string;
  ctaLabel: string;
}[] = [
  {
    type: "course",
    icon: BookOpen,
    label: "AI Course",
    placeholder: "e.g. Teach me about the causes of World War II...",
    suggestions: [
      "Modern day geopolitics",
      "Laws of gravity",
      "Personal finance basics",
      "The history of jazz",
    ],
    accent: "#C8A84B",
    ctaLabel: "Create course",
  },
  {
    type: "assessment",
    icon: Brain,
    label: "Assessment",
    placeholder: "e.g. Test my knowledge of JavaScript fundamentals...",
    suggestions: [
      "JavaScript fundamentals",
      "US Constitutional law",
      "Macroeconomics principles",
      "Data structures & algorithms",
    ],
    accent: "#3B82F6",
    ctaLabel: "Start assessment",
  },
  {
    type: "interview",
    icon: Briefcase,
    label: "Interview",
    placeholder: "e.g. Practice for a software engineering role at Google...",
    suggestions: [
      "Software engineer at Google",
      "Product manager at a startup",
      "Investment banking analyst",
      "UX designer at an agency",
    ],
    accent: "#10B981",
    ctaLabel: "Start interview",
  },
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
  onClick?: () => void;
}

function FeatureCard({ title, eyebrow, description, cta, href, image, delay = 0, onClick }: FeatureCardProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      onClick={() => { onClick?.(); navigate(href); }}
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
          onClick={(e) => { e.stopPropagation(); onClick?.(); navigate(href); }}
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

// ─── Spotlight Hero ─────────────────────────────────────────────────────────

function SpotlightHero({
  firstName,
  onLaunch,
  inputRef,
  activeMode,
  setActiveMode,
}: {
  firstName: string;
  onLaunch: (type: ActionType, topic: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  activeMode: number;
  setActiveMode: (i: number) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const mode = MODES[activeMode];

  const handleSuggestion = (s: string) => {
    setInputValue(s);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (inputValue.trim().length >= 2) {
      onLaunch(mode.type, inputValue.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-[680px] mx-auto text-center pt-12 sm:pt-14 pb-8 px-5"
    >
      {/* Eyebrow */}
      <p className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-[#8a7a5a] mb-3">
        Your learning studio
      </p>

      {/* Heading */}
      <h1 className="text-2xl sm:text-[34px] font-medium text-gray-900 leading-tight tracking-tight mb-2">
        {firstName ? `Good to see you, ${firstName}.` : "Welcome back."}
      </h1>
      <p className="text-sm text-gray-400 mb-7">
        Pick a mode, then tell us what you want to do.
      </p>

      {/* Mode Switcher */}
      <div className="inline-flex bg-gray-100 rounded-full p-[3px] gap-[2px] mb-5 border border-gray-200">
        {MODES.map((m, i) => {
          const Icon = m.icon;
          const isActive = i === activeMode;
          return (
            <button
              key={m.label}
              onClick={() => {
                setActiveMode(i);
                setInputValue("");
                inputRef.current?.focus();
              }}
              className={`flex items-center gap-[7px] px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-[13px] h-[13px] shrink-0" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="max-w-[600px] mx-auto"
        >
          <div
            className="rounded-2xl border-2 overflow-hidden transition-all duration-200 focus-within:shadow-[0_0_0_4px]"
            style={{
              borderColor: `${mode.accent}66`,
            }}
            onFocus={(e) => {
              const box = e.currentTarget;
              box.style.borderColor = mode.accent;
              box.style.boxShadow = `0 0 0 4px ${mode.accent}14`;
            }}
            onBlur={(e) => {
              const box = e.currentTarget;
              if (!box.contains(e.relatedTarget as Node)) {
                box.style.borderColor = `${mode.accent}66`;
                box.style.boxShadow = "none";
              }
            }}
          >
            <textarea
              ref={inputRef}
              rows={2}
              placeholder={mode.placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full px-5 pt-4 pb-2 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none bg-transparent leading-relaxed"
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <span className="text-[11px] text-gray-400">Press Enter to start, Shift+Enter for new line</span>
              <button
                onClick={handleSubmit}
                disabled={inputValue.trim().length < 2}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ background: mode.accent }}
              >
                <Send className="w-3 h-3" />
                {mode.ctaLabel}
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {mode.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 bg-white transition-all duration-150 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Inline Course Wizard ───────────────────────────────────────────────────

function InlineCourseWizard({ initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/courses/generated", { state: { topic: initialTopic, autoCreate: true }, replace: true });
  }, [navigate, initialTopic]);
  return null;
}

// ─── Inline Assessment Wizard ───────────────────────────────────────────────

function InlineAssessmentWizard({ onBack, initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/assessments", { state: { topic: initialTopic, autoCreate: true }, replace: true });
  }, [navigate, initialTopic]);
  return null;
}

// ─── Inline Interview Wizard ────────────────────────────────────────────────

function InlineInterviewWizard({ onBack, initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams({ quickstart: "1", topic: initialTopic });
    navigate(`/assessments/job-interview-simulator?${params.toString()}`, {
      state: { topic: initialTopic, autoCreate: true },
      replace: true,
    });
  }, [navigate, initialTopic]);
  return null;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const [activeWizard, setActiveWizard] = useState<ActionType>(null);
  const [wizardTopic, setWizardTopic] = useState("");
  const [activeMode, setActiveMode] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { items: recentActivity, isLoading } = useRecentActivity(3);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setFirstName(extractFirstName(data.user as Parameters<typeof extractFirstName>[0]));
    });
  }, []);

  const handleLaunch = (type: ActionType, topic: string) => {
    setWizardTopic(topic);
    setActiveWizard(type);
  };

  const handleWizardBack = () => {
    setActiveWizard(null);
    setWizardTopic("");
  };

  const setModeAndFocus = useCallback((modeIndex: number) => {
    setActiveMode(modeIndex);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, []);

  const features: FeatureCardProps[] = [
    {
      title: "AI Courses",
      eyebrow: "AI-Powered Learning",
      description: "Generate personalized learning paths on any topic.",
      cta: "Create Course",
      href: "/courses/generated",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-mart-production-7718665.jpg",
      delay: 0.15,
      onClick: () => setModeAndFocus(0),
    },
    {
      title: "Skill Assessments",
      eyebrow: "Professional Growth",
      description: "Measure your skills against what employers expect.",
      cta: "Take Assessment",
      href: "/assessments",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/skillassessment2.jpg",
      delay: 0.22,
      onClick: () => setModeAndFocus(1),
    },
    {
      title: "Interview Simulator",
      eyebrow: "Career Preparation",
      description: "Practice realistic AI-powered job interviews.",
      cta: "Start Simulation",
      href: "/assessments/job-interview-simulator",
      image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/jobinterviewsimulator.jpg",
      delay: 0.29,
      onClick: () => setModeAndFocus(2),
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
              <InlineCourseWizard onBack={handleWizardBack} initialTopic={wizardTopic} />
            )}
            {activeWizard === "assessment" && (
              <InlineAssessmentWizard onBack={handleWizardBack} initialTopic={wizardTopic} />
            )}
            {activeWizard === "interview" && (
              <InlineInterviewWizard onBack={handleWizardBack} initialTopic={wizardTopic} />
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
            {/* ── Spotlight Hero ──────────────────────────────────── */}
            <div className="relative z-10">
              <SpotlightHero
                firstName={firstName}
                onLaunch={handleLaunch}
                inputRef={inputRef}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
              />
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
                          onClick={() => handleLaunch("course", "")}
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
