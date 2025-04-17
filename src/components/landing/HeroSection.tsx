"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export function HeroSection() {
  return <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:from-gray-900 dark:to-gray-800">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/lovable-uploads/dfd38374-fd74-42a1-9010-8c092a4ae7b6.png" alt="Tuterra AI learning environment" className="w-full h-full object-cover" />
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Take your learning into the real world with{" "}
            <span className="bg-gradient-to-br from-amber-200 to-amber-400 text-transparent bg-clip-text">tuterra</span>
          </h1>
          <p className="text-xl text-white mb-8">An intelligent learning platform that goes beyond helping you absorb information, designed to help you bridge the gap between the classroom and the real world</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="btn-gold-gradient px-8 py-3 rounded-lg flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold hover:bg-amber-500 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/tutor" className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
              Try AI Tutor
            </Link>
          </div>
        </motion.div>
      </div>
    </section>;
}