import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
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
  initialTopic?: string;
}

export function MultiStepAssessmentForm({ 
  onComplete, 
  onCancel, 
  isLoading = false, 
  progress = 0,
  initialTopic
}: MultiStepAssessmentFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AssessmentFormData>>({
    industry: initialTopic || "",
    level: "intermediate",
    questionCount: 15,
    additionalInfo: ""
  });
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;
  const stepLabels = ["Industry", "Role", "Details"];

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
        {isLoading && (
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
              className="bg-[#F9F8F6] rounded-2xl p-8 max-w-md mx-4 text-center shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.06]"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-[#C8A84B] animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-[#091747] mb-2">
                Creating Your Assessment
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Our AI is generating personalized questions based on your requirements...
              </p>
              {showProgress ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-gray-400">{Math.round(progress)}% complete</p>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#C8A84B]" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={formRef} className="w-full">
        {/* Card */}
        <div className="w-full max-w-4xl mx-auto bg-[#F9F8F6] border border-black/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.07)] rounded-2xl relative overflow-hidden">

          {/* Visual anchor — thin warm gradient top strip */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C8A84B]/70 via-amber-200/80 to-transparent" />

          {/* Header */}
          <div className="pt-10 px-8 pb-6 space-y-8">
            {/* Tuterra Logo */}
            <motion.div
              className="flex justify-start"
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

            {/* Title + subtitle */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#091747]">
                Create Skill Assessment
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                Generate AI-powered skill assessments tailored to your industry and role
              </p>
            </div>

            {/* Deliberate numbered stepper */}
            <div className="flex items-center justify-center">
              {stepLabels.map((label, i) => {
                const stepNum = i + 1;
                const isComplete = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                          isComplete
                            ? "bg-[#C8A84B] text-white"
                            : isActive
                            ? "bg-[#091747] text-white"
                            : "bg-stone-200 text-stone-400"
                        }`}
                      >
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : `0${stepNum}`}
                      </div>
                      <span
                        className={`text-[10px] tracking-widest uppercase font-medium ${
                          isActive ? "text-[#091747]" : "text-stone-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-px w-12 mx-3 mb-5 transition-colors duration-300 ${
                          currentStep > stepNum ? "bg-[#C8A84B]" : "bg-stone-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[420px]"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={onCancel}
                  className="text-sm text-stone-400 hover:text-stone-600 transition-colors duration-150 touch-manipulation"
                >
                  Cancel
                </button>
                {currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 touch-manipulation text-stone-400 hover:text-stone-600 hover:bg-transparent px-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 touch-manipulation"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!canProceedToNext() || isLoading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 touch-manipulation"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Assessment
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
