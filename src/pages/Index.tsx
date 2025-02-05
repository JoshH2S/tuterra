import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import FileUpload from "../components/FileUpload";
import { BookOpen, Users, BarChart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    console.log("File selected:", selectedFile.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Transform Your Teaching</span>
              <span className="block text-primary-500">With AI-Powered Education</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Upload your course materials and let our AI assistant create personalized lesson plans,
              quizzes, and study materials for your students.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button 
                onClick={() => navigate('/lesson-planning')}
                size="lg"
                className="bg-primary-500 text-white px-8 py-3 rounded-md hover:bg-primary-600 transition-colors"
              >
                Start AI Lesson Planning
              </Button>
              <Button 
                onClick={() => navigate('/course/tutor')}
                size="lg"
                variant="outline"
                className="px-8 py-3 rounded-md flex items-center gap-2"
              >
                <Brain className="h-5 w-5" />
                Try AI Tutor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">AI Lesson Planning</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Automatically generate structured lesson plans aligned with education standards
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-secondary-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Interactive AI Tutor</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Provide students with personalized assistance and instant feedback
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent-DEFAULT text-white mx-auto">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Performance Analytics</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Track student progress and get AI-suggested improvements
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/course/tutor')}>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">AI Study Assistant</h3>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Get help with study guides, practice quizzes, and personalized learning schedules
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
            <p className="mt-2 text-gray-600">
              Upload your course materials and let our AI do the rest
            </p>
          </div>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      </div>
    </div>
  );
};

export default Index;