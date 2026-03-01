import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";

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
      {/* Image with overlaid text */}
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

      {/* White content section */}
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
      {/* Type dot */}
      <div className="w-8 h-8 rounded-full bg-[#F7F3EC] border border-[#C8A84B]/20 flex items-center justify-center shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {styles.label}
          {item.meta ? ` · ${item.meta}` : ""}
          {" · "}
          {timeAgo(item.timestamp)}
        </p>
      </div>

      {/* Right-side indicator */}
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>("");
  const { items: recentActivity, isLoading } = useRecentActivity(3);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setFirstName(extractFirstName(data.user as Parameters<typeof extractFirstName>[0]));
    });
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
      {/* Match other pages: fixed white background */}
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white" />

      {/* ── Hero Card ────────────────────────────────────────────────── */}
      <div className="relative z-10 mb-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4"
          style={{ minHeight: "300px" }}
        >
          {/* Left: greeting */}
          <div className="flex flex-col justify-between p-4 sm:w-[40%] shrink-0">
            <div>
              <p className="text-xs font-mono text-[#8a7a5a] mb-4 tracking-wide uppercase">
                Your learning studio
              </p>
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="h-7 w-7 text-[#7a6a2a] mt-1 shrink-0" />
                <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">
                  {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
                </h1>
              </div>
              <p className="text-sm text-[#5a5040] leading-relaxed max-w-xs">
                Pick up where you left off, or start something new.
              </p>
            </div>
          </div>

          {/* Right: decorative image */}
          <div
            className="flex-1 rounded-xl bg-cover bg-center min-h-[180px] sm:min-h-0"
            style={{
              backgroundImage:
                "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-donghuangmingde-2177482.jpg')",
            }}
          />
        </motion.div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 relative z-10">

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map((f) => (
            <FeatureCard key={f.href} {...f} />
          ))}
        </section>

        {/* Recent Activity */}
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
                    onClick={() => {}}
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
    </>
  );
}
