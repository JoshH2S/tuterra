import { useState } from "react";
import { Header1 } from "@/components/ui/header";
import { InternshipPreviewForm } from "@/components/internship-preview/InternshipPreviewForm";
import { InternshipPreviewResults } from "@/components/internship-preview/InternshipPreviewResults";
import { VirtualInternshipSignupModal } from "@/components/internship-preview/VirtualInternshipSignupModal";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Calendar, BookOpen, Sparkles, Zap, Target, Trophy } from "lucide-react";

export interface InternshipPreviewData {
  industry: string;
  jobRole?: string;
  jobDescription?: string;
  internshipDurationWeeks: number;
  useExperienceBasedTailoring?: boolean;
  education?: string;
  fieldOfStudy?: string;
  experienceYears?: number;
  certifications?: string[];
  skills?: string[];
  careerGoal?: string;
}

export interface InternshipPreviewResponse {
  company: {
    name: string;
    sector: string;
    description: string;
    logoUrl?: string;
    vision: string;
    mission: string;
    foundedYear: number;
    employeeCount: number;
    headquartersLocation: string;
    websiteUrl?: string;
    coreValues: string[];
  };
  supervisor: {
    name: string;
    title: string;
    introMessage: string;
  };
  tasks: Array<{
    week: number;
    title: string;
    description: string;
  }>;
  expectations: {
    duration: string;
    totalTasks: number;
    finalDeliverable: string;
    feedbackCycle: string;
  };
  metadata?: {
    generatedAt: string;
    industry: string;
    duration: number;
    tailored: boolean;
  };
}

export default function InternshipPreview() {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewData, setPreviewData] = useState<InternshipPreviewData | null>(null);
  const [results, setResults] = useState<InternshipPreviewResponse | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleFormComplete = (data: InternshipPreviewData, previewResults: InternshipPreviewResponse) => {
    setPreviewData(data);
    setResults(previewResults);
  };

  const handleGetCurrentStep = (step: number) => {
    setCurrentStep(step);
  };

  const featureCards = [
    {
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      title: "Realistic Company",
      description: "Work for a virtual company with authentic projects and deadlines"
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Virtual Supervisor",
      description: "Get guidance and feedback from an AI supervisor throughout your internship"
    },
    {
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      title: "Structured Timeline",
      description: "6-12 week program with progressive tasks and milestones"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-orange-600" />,
      title: "Real Skills",
      description: "Build portfolio-worthy projects that employers actually want to see"
    }
  ];

  if (results && previewData) {
    return <InternshipPreviewResults results={results} formData={previewData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header - Always show */}
      <Header1 />
      
      {/* Conditional content based on step */}
      {currentStep === 1 ? (
        // Step 1: Show full landing page layout
        <div className="pt-20">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
              <div className="text-center space-y-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-white/20 rounded-full animate-pulse"></div>
                    <Sparkles className="h-16 w-16 text-yellow-300 relative z-10" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Virtual Internship Preview
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                  Experience what it's like to work at a real company. Get a personalized preview 
                  of your virtual internship before you commit.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Zap className="h-4 w-4" />
                    <span>2-minute setup</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Target className="h-4 w-4" />
                    <span>Personalized experience</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                    <Trophy className="h-4 w-4" />
                    <span>Real-world projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="py-16 bg-white/50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What You'll Experience
                </h2>
                <p className="text-lg text-gray-600">
                  Get a taste of professional work life with these key features
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featureCards.map((card, index) => (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 bg-gray-50 rounded-full">
                          {card.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <InternshipPreviewForm 
                onComplete={handleFormComplete} 
                onStepChange={handleGetCurrentStep}
              />
            </div>
          </div>
        </div>
      ) : (
        // Steps 2+: Show simplified layout with form at top
        <div className="pt-20">
          {/* Simple header for steps 2+ */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Virtual Internship Preview
              </h1>
              <p className="text-blue-100 mt-2">
                Complete your setup to see your personalized internship experience
              </p>
            </div>
          </div>

          {/* Form at top */}
          <div className="py-8">
            <div className="max-w-4xl mx-auto px-4">
              <InternshipPreviewForm 
                onComplete={handleFormComplete} 
                onStepChange={handleGetCurrentStep}
              />
            </div>
          </div>
        </div>
      )}

      <VirtualInternshipSignupModal 
        open={showSignupModal} 
        onOpenChange={setShowSignupModal} 
      />
    </div>
  );
}
