import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// ─── Career Engine Cards ──────────────────────────────────────────────────────

const cards = [
  {
    eyebrow: "AI-Powered Learning",
    title: "AI Courses",
    description: "Generate personalized learning paths on any topic, structured to your pace and goals.",
    cta: "Create Course",
    href: "/auth?tab=signup",
    image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/pexels-mart-production-7718665.jpg",
  },
  {
    eyebrow: "Professional Growth",
    title: "Skill Assessments",
    description: "Measure your skills against what employers expect with structured, role-specific evaluations.",
    cta: "Take Assessment",
    href: "/auth?tab=signup",
    image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/skillassessment2.jpg",
  },
  {
    eyebrow: "Career Preparation",
    title: "Interview Simulator",
    description: "Practice realistic AI-powered job interviews with instant, detailed feedback on every response.",
    cta: "Start Simulation",
    href: "/auth?tab=signup",
    image: "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/jobinterviewsimulator.jpg",
  },
];

function FeatureCard({ eyebrow, title, description, cta, href, image, delay = 0 }: typeof cards[0] & { delay?: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      onClick={() => navigate(href)}
      className="group rounded-2xl overflow-hidden border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.08)] cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
    >
      {/* Full-image card with overlaid content */}
      <div
        className="relative h-[340px] bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-[10px] font-mono text-white/65 uppercase tracking-widest mb-2">
            {eyebrow}
          </p>
          <h3 className="text-2xl font-semibold text-white leading-tight tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-[34ch]">
            {description}
          </p>

          <div className="mt-5">
            <Link
              to={href}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white text-[#091747] hover:bg-white/90 transition-colors duration-150"
            >
              {cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skills & Career Engine Section ──────────────────────────────────────────

export function FeatureShowcaseDemo() {
  return (
    <section className="bg-[#F5F4F1] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#C8A84B] mb-4">
            Your Career Engine
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#091747]">
            Every Tool You Need to Get Career-Ready
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <FeatureCard key={card.title} {...card} delay={i * 0.08} />
          ))}
        </div>

      </div>
    </section>
  );
}
