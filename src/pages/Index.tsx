
import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, ArrowRight, Sparkles, Users } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section-dark";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white dark:from-gray-950 dark:to-gray-900 -m-4 md:-m-8">
      <div className="relative">
        <HeroSection 
          title={
            <>
              <img 
                src="/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png" 
                alt="Logo" 
                className="w-32 h-32 object-contain mb-8"
              />
              <div className="flex items-center gap-4">
                Learn, Adapt, Succeed
              </div>
            </>
          }
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
          gridOptions={{
            angle: 65,
            opacity: 0.3,
            cellSize: 50,
            lightLineColor: "#4a4a4a",
            darkLineColor: "#2a2a2a",
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 rounded-3xl backdrop-blur-sm"></div>
          <div className="relative">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Featured Benefits
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Discover how our platform can transform your learning experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 border-none bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Brain className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Intelligent Assessment</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      AI-powered analysis of your learning patterns to provide personalized feedback and recommendations.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Users className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Collaborative Learning</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Connect with peers and experts in real-time discussion forums and group study sessions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Bot className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">AI Tutoring</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      24/7 access to AI tutors that adapt to your learning style and pace.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
