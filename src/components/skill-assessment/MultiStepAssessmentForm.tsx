import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssessmentIndustryStep } from "./steps/AssessmentIndustryStep";
import { AssessmentRoleStep } from "./steps/AssessmentRoleStep";
import { AssessmentDetailsStep } from "./steps/AssessmentDetailsStep";

export interface AssessmentFormData {
  industry: string;
  role: string;
  level: string;
  questionCount: number;
  additionalInfo: string;
}

interface MultiStepAssessmentFormProps {
  onComplete: (data: AssessmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  progress?: number;
}

export function MultiStepAssessmentForm({ 
  onComplete, 
  onCancel, 
  isLoading = false, 
  progress = 0 
}: MultiStepAssessmentFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AssessmentFormData>>({
    level: "intermediate",
    questionCount: 15,
    additionalInfo: ""
  });
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;
  const stepProgress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Select Industry",
    "Target Role", 
    "Assessment Details"
  ];

  // Scroll to top when step changes
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [currentStep]);

  const updateFormData = (data: Partial<AssessmentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.industry && formData.industry.trim().length > 0;
      case 2:
        return formData.role && formData.role.trim().length > 0;
      case 3:
        return formData.level && formData.questionCount;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      toast({
        title: "Please complete this step",
        description: "Fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    if (!canProceedToNext()) {
      toast({
        title: "Please complete all fields",
        description: "Fill in all required information before generating your assessment.",
        variant: "destructive",
      });
      return;
    }

    const completeData: AssessmentFormData = {
      industry: formData.industry!,
      role: formData.role!,
      level: formData.level!,
      questionCount: formData.questionCount!,
      additionalInfo: formData.additionalInfo || ""
    };

    onComplete(completeData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AssessmentIndustryStep 
            value={formData.industry || ''} 
            onChange={(industry) => updateFormData({ industry })} 
          />
        );
      case 2:
        return (
          <AssessmentRoleStep 
            value={formData.role || ''} 
            onChange={(role) => updateFormData({ role })} 
          />
        );
      case 3:
        return (
          <AssessmentDetailsStep 
            level={formData.level || 'intermediate'}
            questionCount={formData.questionCount || 15}
            additionalInfo={formData.additionalInfo || ''}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  const showProgress = isLoading && progress > 0;

  return (
    <React.Fragment>
      {/* Loading Overlay */}
      <AnimatePresence>
        {(isLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <Sparkles className="h-6 w-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Creating Your Assessment
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our AI is generating personalized questions based on your requirements...
                  </p>
                </div>

                {showProgress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  This may take a moment as we analyze your requirements and create targeted questions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={formRef} className="w-full max-w-4xl mx-auto">
        <Card className="w-full shadow-xl bg-white/95 backdrop-blur-md border border-white/20">
          <CardHeader className="text-center pb-4">
            {/* Tuterra Logo */}
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
                alt="Tuterra Logo" 
                className="h-8 md:h-10 w-auto object-contain" 
              />
            </motion.div>
            
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Create Skill Assessment
            </CardTitle>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Generate AI-powered skill assessments tailored to your industry and role
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(stepProgress)}% Complete</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 md:space-x-4">
                {stepTitles.map((title, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;
                  
                  return (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {isCompleted ? '✓' : stepNumber}
                      </div>
                      <span className={`
                        ml-2 text-xs md:text-sm font-medium hidden sm:inline
                        ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                      `}>
                        {title}
                      </span>
                      {index < stepTitles.length - 1 && (
                        <div className={`
                          w-8 md:w-12 h-0.5 mx-2 md:mx-4
                          ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-6">
            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px] flex items-center justify-center"
            >
              {renderStep()}
            </motion.div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
              <div className="flex gap-3 sm:flex-1">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                
                {currentStep > 1 && (
                  <Button
                    variant="default"
                    onClick={handlePrevious}
                    className="flex-1 sm:flex-none"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="flex-1 sm:flex-none"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!canProceedToNext() || isLoading}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Assessment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </React.Fragment>
  );
}
