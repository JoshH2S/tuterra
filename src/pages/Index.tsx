import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to EduAI</h1>
          <p className="text-xl text-gray-600 mb-8">
            Enhance your teaching with AI-powered tools
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/courses"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              to="/tutor"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90"
            >
              Try AI Tutor
            </Link>
          </div>
        </section>
        
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <p className="text-lg text-gray-600 mb-4">
            Our AI Tutor can help you with study guides, quizzes, and more!
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
