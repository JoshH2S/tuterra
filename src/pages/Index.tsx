import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BookOpen, Brain, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6 text-primary-800">
            Welcome to EduAI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your teaching experience with AI-powered tools designed to enhance learning and save time
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/courses"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/tutor"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg shadow-lg transition-all hover:scale-105"
            >
              Try AI Tutor
            </Link>
          </div>
        </section>
        
        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">Smart Courses</h3>
            <p className="text-gray-600">
              Create and manage courses with AI assistance for better organization and delivery
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">AI Tutor</h3>
            <p className="text-gray-600">
              Provide personalized learning experiences with our advanced AI tutoring system
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary-800">Lesson Planning</h3>
            <p className="text-gray-600">
              Generate comprehensive lesson plans with AI-powered insights and suggestions
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;