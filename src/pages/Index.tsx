
import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, ArrowRight, Sparkles, Users } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section-dark";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-2rem)] -m-4 md:-m-8 bg-gradient-to-b from-primary-100 to-white dark:from-gray-950 dark:to-gray-900">
      <HeroSection 
        title="Learn, Adapt, Succeed"
        subtitle={{
          regular: "Transform your learning with ",
          gradient: "AI-powered education",
        }}
        description="Experience a revolutionary approach to learning with our AI-enhanced educational platform. Join us and unlock your full potential."
        ctaText={
          <div className="flex gap-4">
            <Link
              to="/courses"
              className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all py-4 px-10"
            >
              Get Started
            </Link>
            <Link
              to="/tutor"
              className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all py-4 px-10"
            >
              Try AI Tutor
            </Link>
          </div>
        }
        ctaHref="#"
        bottomImage={{
          light: "/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png",
          dark: "/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png"
        }}
        gridOptions={{
          angle: 65,
          opacity: 0.3,
          cellSize: 50,
          lightLineColor: "#4a4a4a",
          darkLineColor: "#2a2a2a",
        }}
      />
    </div>
  );
};

export default Index;
