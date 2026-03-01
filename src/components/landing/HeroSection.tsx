"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PHOTO_URL =
  "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/Untitled%20Project.jpg";

export function HeroSection() {
  return (
    <section className="relative h-[88vh] overflow-hidden flex items-end">
      {/* Background photo — anchored right so the face stays visible */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${PHOTO_URL}')`,
          backgroundPosition: "center right",
        }}
      />

      {/* Gold gradient — heavy on the left text zone, drops off fast to let the photo dominate */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(72,46,0,0.95) 0%, rgba(100,65,5,0.88) 22%, rgba(150,100,10,0.60) 40%, rgba(200,168,75,0.18) 58%, transparent 72%)",
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(60,38,0,0.72) 0%, transparent 40%)",
        }}
      />

      {/* Bottom-anchored content */}
      <div className="relative z-10 w-full max-w-6xl px-6 pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Eyebrow */}
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C8A84B] mb-5">
              AI-Powered Career Readiness
            </p>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.04] mb-6">
              Where Learning<br />
              Meets the<br />
              Real World.
            </h1>

            {/* Sub-copy */}
            <p className="text-base text-white/55 leading-relaxed max-w-md mb-10">
              An intelligent platform built for serious learners — bridging
              knowledge with career readiness through AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth?tab=signup">
                <button className="flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white text-[#091747] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/internship-preview">
                <button className="flex items-center justify-center gap-2 px-7 py-3 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10 active:scale-[0.98] transition-all duration-150 backdrop-blur-sm">
                  See How It Works
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
