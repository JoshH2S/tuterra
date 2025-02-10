import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, ArrowRight, Sparkles, Users } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section-dark";
import { Card } from "@/components/ui/card";
import { BackgroundPaths } from "@/components/ui/background-paths";

const Index = () => {
  return (
    <div className="min-h-screen">
      <BackgroundPaths title="Learn Adapt Succeed" />
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 z-10">
          <img 
            src="/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png" 
            alt="Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10 rounded-3xl backdrop-blur-sm"></div>
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
              <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Intelligent Assessment</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      AI-powered analysis of your learning patterns to provide personalized feedback and recommendations.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Collaborative Learning</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Connect with peers and experts in real-time discussion forums and group study sessions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                    <Bot className="h-6 w-6 text-blue-500" />
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
