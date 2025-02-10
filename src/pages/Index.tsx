
import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, ArrowRight, Sparkles, Users } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section-dark";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-2rem)] -m-4 md:-m-8 bg-gradient-to-b from-primary-100 to-white">
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
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-16 animate-fadeIn">
          <img 
            src="/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png" 
            alt="EduPortal"
            className="h-36 mx-auto mb-6"
          />
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Learn, Adapt, Succeed with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your learning experience with AI-powered tools designed to enhance education and save time
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/courses"
              className="group bg-primary hover:bg-primary-600 text-primary-foreground px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/tutor"
              className="bg-white hover:bg-primary-100 text-primary-700 border-2 border-primary px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              Try AI Tutor
            </Link>
          </div>
        </section>
        
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Bot className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">AI in Education</h3>
            <p className="text-gray-600">
              Revolutionize learning with AI assistance for better comprehension and retention
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">Smart Learning</h3>
            <p className="text-gray-600">
              Personalized learning paths adapted to your unique needs and pace
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">Course Creation</h3>
            <p className="text-gray-600">
              Create engaging courses with AI-powered tools and insights
            </p>
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur rounded-2xl p-8 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-800 mb-4">Featured Benefits</h2>
            <p className="text-gray-600">Discover how our AI-powered platform can transform your educational journey</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Intelligent Assessment</h3>
                <p className="text-gray-600">Get instant feedback and personalized recommendations to improve your learning</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Collaborative Learning</h3>
                <p className="text-gray-600">Connect with peers and experts in an AI-enhanced learning environment</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
