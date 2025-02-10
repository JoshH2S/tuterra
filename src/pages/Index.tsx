
import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, ArrowRight, Sparkles, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-2rem)] -m-4 md:-m-8 bg-gradient-to-b from-primary-100 to-white">
      <main className="container mx-auto px-4 py-8">
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
