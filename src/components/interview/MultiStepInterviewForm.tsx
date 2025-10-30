import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InterviewIndustryStep } from "./steps/InterviewIndustryStep";
import { InterviewJobTitleStep } from "./steps/InterviewJobTitleStep";
import { InterviewJobDescriptionStep } from "./steps/InterviewJobDescriptionStep";
import { InterviewFormData } from "@/hooks/interview/utils/validation";

export interface ExtendedInterviewFormData extends InterviewFormData {
  // Extended form data can be added here if needed in the future
}

interface MultiStepInterviewFormProps {
  onComplete: (data: ExtendedInterviewFormData) => Promise<void>;
  onStepChange?: (step: number) => void;
  isLoading?: boolean;
  progress?: number;
}

export function MultiStepInterviewForm({ 
  onComplete, 
  onStepChange, 
  isLoading = false, 
  progress = 0 
}: MultiStepInterviewFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedInterviewFormData>>({});
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;
  const progressValue = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Select Industry",
    "Job Title", 
    "Job Description"
  ];

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Scroll to top when step changes
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (currentStep === 1) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
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
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [currentStep]);

  const updateFormData = (data: Partial<ExtendedInterviewFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!formData.industry;
      case 2:
        return !!formData.jobTitle;
      case 3:
        return !!formData.jobDescription && formData.jobDescription.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    if (!canProceedToNext()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields before generating your interview.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.industry || !formData.jobTitle || !formData.jobDescription) {
      toast({
        title: "Missing Required Information",
        description: "Please ensure all required fields are completed.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const completeFormData: ExtendedInterviewFormData = {
        industry: formData.industry,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription
      };

      await onComplete(completeFormData);
    } catch (error) {
      console.error("Error generating interview:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InterviewIndustryStep 
            value={formData.industry || ''} 
            onChange={(industry) => updateFormData({ industry })} 
          />
        );
      case 2:
        return (
          <InterviewJobTitleStep 
            value={formData.jobTitle || ''} 
            onChange={(jobTitle) => updateFormData({ jobTitle })} 
          />
        );
      case 3:
        return (
          <InterviewJobDescriptionStep 
            value={formData.jobDescription || ''} 
            onChange={(jobDescription) => updateFormData({ jobDescription })} 
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
        {(isGenerating || isLoading) && (
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
              className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isGenerating ? "Creating Your Interview" : "Preparing Questions"}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {isGenerating 
                  ? "We're analyzing your job details and crafting personalized interview questions..."
                  : "This may take a moment as we prepare your interview experience..."
                }
              </p>
              {showProgress ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {progress < 30 && "Analyzing job requirements..."}
                    {progress >= 30 && progress < 60 && "Generating questions..."}
                    {progress >= 60 && progress < 90 && "Finalizing interview..."}
                    {progress >= 90 && "Almost ready..."}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={formRef} className="w-full">
        <Card className="w-full max-w-4xl mx-auto shadow-xl bg-white/95 backdrop-blur-md border border-white/20">
          <CardHeader className="space-y-4 pb-6">
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
            
            <div className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Job Interview Simulator
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Get personalized interview practice with AI-powered questions
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Step {currentStep} of {totalSteps}</span>
                <span className="text-gray-600">{Math.round(progressValue)}% Complete</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                {stepTitles.map((title, index) => (
                  <span 
                    key={index}
                    className={`${
                      index + 1 <= currentStep ? 'text-blue-600 font-medium' : ''
                    }`}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isGenerating || isLoading}
                className="flex items-center gap-2 touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNext() || isGenerating || isLoading}
                    className="flex items-center gap-2 px-6 touch-manipulation"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!canProceedToNext() || isGenerating || isLoading}
                    className="flex items-center gap-2 px-6 bg-green-600 hover:bg-green-700 touch-manipulation"
                  >
                    {isGenerating || isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Interview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Start Interview
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
