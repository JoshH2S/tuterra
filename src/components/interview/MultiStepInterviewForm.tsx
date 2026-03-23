import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { InterviewIndustryStep } from "./steps/InterviewIndustryStep";
import { InterviewJobTitleStep } from "./steps/InterviewJobTitleStep";
import { InterviewJobDescriptionStep } from "./steps/InterviewJobDescriptionStep";
import { InterviewFormData } from "@/hooks/interview/utils/validation";

export interface ExtendedInterviewFormData extends InterviewFormData {
  practiceMode: "specific-job" | "general-practice";
}

interface MultiStepInterviewFormProps {
  onComplete: (data: ExtendedInterviewFormData) => Promise<void>;
  onStepChange?: (step: number) => void;
  isLoading?: boolean;
  progress?: number;
  initialTopic?: string;
  skipIndustry?: boolean;
}

export function MultiStepInterviewForm({ 
  onComplete, 
  onStepChange, 
  isLoading = false, 
  progress = 0,
  initialTopic,
  skipIndustry = false
}: MultiStepInterviewFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(skipIndustry ? 2 : 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedInterviewFormData>>({
    practiceMode: "specific-job",
    ...(initialTopic ? { jobTitle: initialTopic } : {})
  });
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;

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
        return formData.practiceMode === "general-practice" || !!formData.jobDescription?.trim();
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
    const minStep = skipIndustry ? 2 : 1;
    if (currentStep > minStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipIndustryForGeneralPractice = () => {
    updateFormData({ industry: "", practiceMode: "general-practice" });
    setCurrentStep(2);
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
    if (
      (!skipIndustry && !formData.industry) ||
      !formData.jobTitle ||
      (formData.practiceMode !== "general-practice" && !formData.jobDescription?.trim())
    ) {
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
        industry: formData.industry || "",
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription || "",
        practiceMode: formData.practiceMode || "specific-job"
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
            onSkip={!skipIndustry ? handleSkipIndustryForGeneralPractice : undefined}
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
            practiceMode={formData.practiceMode || "specific-job"}
            onPracticeModeChange={(practiceMode) => updateFormData({ practiceMode })}
          />
        );
      default:
        return null;
    }
  };

  const showProgress = isLoading && progress > 0;

  const stepLabels = skipIndustry ? ["Role", "Description"] : ["Industry", "Role", "Description"];
  const minStep = skipIndustry ? 2 : 1;

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
              className="bg-[#F9F8F6] rounded-2xl p-8 max-w-md mx-4 text-center shadow-[0_2px_24px_rgba(0,0,0,0.07)] border border-black/[0.06]"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-[#C8A84B] animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-[#111] mb-2">
                {isGenerating ? "Creating Your Interview" : "Preparing Questions"}
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                {isGenerating 
                  ? "We're analyzing your job details and crafting personalized interview questions..."
                  : "This may take a moment as we prepare your interview experience..."
                }
              </p>
              {showProgress ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-gray-400">
                    {progress < 30 && "Analyzing job requirements..."}
                    {progress >= 30 && progress < 60 && "Generating questions..."}
                    {progress >= 60 && progress < 90 && "Finalizing interview..."}
                    {progress >= 90 && "Almost ready..."}
                  </p>
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
        {/* Card — Option B: Apple-like depth */}
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
                Job Interview Simulator
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                Get personalized interview practice with AI-powered questions
              </p>
            </div>

            {/* Deliberate numbered stepper */}
            <div className="flex items-center justify-center">
              {stepLabels.map((label, i) => {
                const actualStep = skipIndustry ? i + 2 : i + 1;
                const displayNum = i + 1;
                const isComplete = currentStep > actualStep;
                const isActive = currentStep === actualStep;
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
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : `0${displayNum}`}
                      </div>
                      <span
                        className={`text-[10px] tracking-widest uppercase font-medium ${
                          isActive ? "text-[#091747]" : "text-stone-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div
                        className={`h-px w-12 mx-3 mb-5 transition-colors duration-300 ${
                          currentStep > actualStep ? "bg-[#C8A84B]" : "bg-stone-200"
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

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-10">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === minStep || isGenerating || isLoading}
                className="flex items-center gap-2 touch-manipulation text-stone-400 hover:text-stone-600 hover:bg-transparent px-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceedToNext() || isGenerating || isLoading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 touch-manipulation"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!canProceedToNext() || isGenerating || isLoading}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 touch-manipulation"
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
