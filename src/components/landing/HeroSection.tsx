
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Background image */}
      <div className="absolute inset-0 z-0 block sm:hidden">
        <img
          src="https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters//Businesswoman%20Presenting%20in%20Conference%20Room.jpg"
          alt="Businesswoman Presenting in Conference Room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      {/* Desktop/Tablet Background image */}
      <div className="absolute inset-0 z-0 hidden sm:block">
        <img
          src="https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters//Animated%20Quiz%20Character%20in%20Office.jpg"
          alt="Animated Quiz Character in Office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Take your learning into the real world with{" "}
            <span className="bg-gradient-to-br from-amber-200 to-amber-400 text-transparent bg-clip-text">tuterra</span>
          </h1>
          <p className="text-xl text-white mb-8">
            An intelligent learning platform that goes beyond helping you absorb information; designed to help you bridge the gap between the classroom and the real world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth?tab=signup"
              className="btn-gold-gradient px-8 py-3 rounded-lg flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold hover:bg-amber-500 transition-colors"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/internship-preview"
            >
              <Button
                variant="outline"
                className="px-8 py-3 h-auto bg-white/90 hover:bg-white text-gray-900 font-semibold gap-2 backdrop-blur-sm"
              >
                <Briefcase className="w-4 h-4" />
                Try Preview
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
