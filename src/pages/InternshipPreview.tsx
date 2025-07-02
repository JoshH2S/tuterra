import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InternshipPreviewForm } from "@/components/internship-preview/InternshipPreviewForm";
import { InternshipPreviewResults } from "@/components/internship-preview/InternshipPreviewResults";
import { VirtualInternshipSignupModal } from "@/components/internship-preview/VirtualInternshipSignupModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, Target } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState<'form' | 'results'>('form');
  const [previewData, setPreviewData] = useState<InternshipPreviewResponse | null>(null);
  const [formData, setFormData] = useState<InternshipPreviewData | null>(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔄 Modal state changed:', { isSignupModalOpen });
  }, [isSignupModalOpen]);

  // Listen for custom event to open the signup modal
  useEffect(() => {
    const handleOpenSignup = () => {
      console.log('📨 Received openVirtualInternshipSignup event - opening modal');
      setIsSignupModalOpen(true);
    };

    console.log('🎧 Setting up event listener for openVirtualInternshipSignup');
    window.addEventListener('openVirtualInternshipSignup', handleOpenSignup);
    return () => {
      console.log('🧹 Cleaning up event listener for openVirtualInternshipSignup');
      window.removeEventListener('openVirtualInternshipSignup', handleOpenSignup);
    };
  }, []);

  const handleFormComplete = (data: InternshipPreviewData, results: InternshipPreviewResponse) => {
    setFormData(data);
    setPreviewData(results);
    setCurrentStep('results');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setPreviewData(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            {/* Tuterra Logo */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
                alt="Tuterra Logo" 
                className="h-16 w-auto object-contain mx-auto" 
              />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Virtual Internship Preview
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Experience what a Tuterra virtual internship would look like for your career goals
            </motion.p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      {currentStep === 'form' && (
        <motion.div 
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4 text-center">
                <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Realistic Company</h3>
                <p className="text-xs text-gray-600">AI-generated company profile</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Virtual Supervisor</h3>
                <p className="text-xs text-gray-600">Dedicated mentor & feedback</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Structured Tasks</h3>
                <p className="text-xs text-gray-600">Progressive skill building</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Flexible Duration</h3>
                <p className="text-xs text-gray-600">6-12 weeks, your choice</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <InternshipPreviewForm onComplete={handleFormComplete} />
              </motion.div>
            )}
            
            {currentStep === 'results' && previewData && formData && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <InternshipPreviewResults 
                  data={previewData} 
                  formData={formData}
                  onBackToForm={handleBackToForm} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to start your virtual internship journey?{" "}
              <button 
                onClick={() => setIsSignupModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Virtual Internship Signup Modal */}
      <VirtualInternshipSignupModal 
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </div>
  );
} 