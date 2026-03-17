"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PHOTO_URL =
  "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/Untitled%20Project.jpg";

export function HeroSection() {
  return (
    <section className="relative h-[100svh] sm:h-[88vh] overflow-hidden flex items-end">
      {/* Background photo — full bleed on mobile, anchored right on desktop */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${PHOTO_URL}')`,
          backgroundPosition: "center",
        }}
      />

      {/* Mobile: bottom-heavy gradient for text readability */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(20,12,0,0.92) 0%, rgba(40,24,0,0.70) 35%, rgba(60,36,0,0.30) 55%, transparent 75%)",
        }}
      />

      {/* Desktop: side gradient */}
      <div
        className="absolute inset-0 hidden sm:block"
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
      <div className="relative z-10 w-full max-w-6xl px-5 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Eyebrow */}
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-[#C8A84B] mb-4 sm:mb-5">
              AI-Powered Career Readiness
            </p>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.06] mb-5 sm:mb-6">
              Where Learning<br />
              Meets the<br />
              Real World.
            </h1>

            {/* Sub-copy */}
            <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-md mb-8 sm:mb-10">
              An intelligent platform built for serious learners — bridging
              knowledge with career readiness through AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth?tab=signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 sm:py-3 rounded-full bg-white text-[#091747] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
