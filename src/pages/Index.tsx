
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
      <main className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent dark:from-transparent dark:via-purple-400/5 pointer-events-none" />
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16 relative">
          <div className="bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 backdrop-blur p-8 rounded-xl border border-white/20 dark:border-white/5 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">AI in Education</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Revolutionize learning with AI assistance for better comprehension and retention
            </p>
          </div>

          <div className="bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 backdrop-blur p-8 rounded-xl border border-white/20 dark:border-white/5 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Smart Learning</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Personalized learning paths adapted to your unique needs and pace
            </p>
          </div>

          <div className="bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 backdrop-blur p-8 rounded-xl border border-white/20 dark:border-white/5 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Course Creation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create engaging courses with AI-powered tools and insights
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-tr from-zinc-300/20 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 backdrop-blur rounded-2xl p-8 max-w-6xl mx-auto border border-white/20 dark:border-white/5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Featured Benefits</h2>
            <p className="text-gray-600 dark:text-gray-300">Discover how our AI-powered platform can transform your educational journey</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Intelligent Assessment</h3>
                <p className="text-gray-600 dark:text-gray-300">Get instant feedback and personalized recommendations to improve your learning</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Collaborative Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect with peers and experts in an AI-enhanced learning environment</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
