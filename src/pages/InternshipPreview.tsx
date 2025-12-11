
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
  const [formStep, setFormStep] = useState(1);

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

  const handleStepChange = (step: number) => {
    setFormStep(step);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - only show on step 1 */}
      {formStep === 1 && currentStep === 'form' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="text-center">
              {/* Tuterra Logo */}
              <motion.div
                className="mb-4 md:mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
                  alt="Tuterra Logo" 
                  className="h-12 md:h-16 w-auto object-contain mx-auto" 
                />
              </motion.div>
              
              <motion.h1 
                className="text-2xl md:text-4xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Virtual Internship Preview
              </motion.h1>
              <motion.p 
                className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Experience what a Tuterra virtual internship would look like for your career goals
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section - only show on step 1 */}
      {formStep === 1 && currentStep === 'form' && (
        <motion.div 
          className="container mx-auto px-4 py-6 md:py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Building2 className="h-6 md:h-8 w-6 md:w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-xs md:text-sm">Realistic Company</h3>
                <p className="text-xs text-gray-600 hidden md:block">AI-generated company profile</p>
                <p className="text-xs text-gray-600 md:hidden">AI company profile</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Users className="h-6 md:h-8 w-6 md:w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-xs md:text-sm">Virtual Supervisor</h3>
                <p className="text-xs text-gray-600 hidden md:block">Dedicated mentor & feedback</p>
                <p className="text-xs text-gray-600 md:hidden">Mentor & feedback</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Target className="h-6 md:h-8 w-6 md:w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-xs md:text-sm">Structured Tasks</h3>
                <p className="text-xs text-gray-600 hidden md:block">Progressive skill building</p>
                <p className="text-xs text-gray-600 md:hidden">Skill building</p>
              </CardContent>
            </Card>
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-3 md:p-4 text-center">
                <Clock className="h-6 md:h-8 w-6 md:w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-xs md:text-sm">Flexible Duration</h3>
                <p className="text-xs text-gray-600 hidden md:block">6-12 weeks, your choice</p>
                <p className="text-xs text-gray-600 md:hidden">6-12 weeks</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8 md:pb-12">
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
                <InternshipPreviewForm 
                  onComplete={handleFormComplete} 
                  onStepChange={handleStepChange}
                />
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
      <div className="bg-white border-t mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Ready to start your virtual internship journey?{" "}
              <button 
                onClick={() => setIsSignupModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer touch-manipulation"
              >
                Get Started
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

      {/* Custom styles for step 4 button sizing */}
      <style>{`
        /* Target the step 4 navigation buttons specifically */
        .step-navigation-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .step-navigation-buttons button {
          min-width: 120px !important;
          height: 44px !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          white-space: nowrap !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        /* Responsive adjustments for mobile */
        @media (max-width: 640px) {
          .step-navigation-buttons {
            gap: 0.75rem;
          }
          
          .step-navigation-buttons button {
            min-width: 100px !important;
            height: 40px !important;
            padding: 6px 12px !important;
            font-size: 13px !important;
          }
        }
        
        /* Ensure proper spacing with step indicators */
        .step-indicators {
          margin: 0 1rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 640px) {
          .step-indicators {
            margin: 0 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
