import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IndustryStep } from "./steps/IndustryStep";
import { JobRoleStep } from "./steps/JobRoleStep";
import { JobDescriptionStep } from "./steps/JobDescriptionStep";
import { DurationStep } from "./steps/DurationStep";
import { InternshipPreviewData, InternshipPreviewResponse } from "@/pages/InternshipPreview";

interface InternshipPreviewFormProps {
  onComplete: (data: InternshipPreviewData, results: InternshipPreviewResponse) => void;
  onStepChange?: (step: number) => void;
}

export function InternshipPreviewForm({ onComplete, onStepChange }: InternshipPreviewFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<InternshipPreviewData>>({});
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Select Industry",
    "Job Role",
    "Experience & Background",
    "Internship Duration"
  ];

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Scroll to top only when the first step loads
  useEffect(() => {
    // Only scroll to top for the first step
    if (currentStep === 1) {
      // Add a small delay to ensure content is rendered before scrolling
      const scrollTimer = setTimeout(() => {
        // Scroll to the form container specifically, or window top if form ref not available
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
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(scrollTimer);
    }
  }, [currentStep]);

  const updateFormData = (data: Partial<InternshipPreviewData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.industry && formData.industry.trim().length > 0;
      case 2:
        return true; // Job role is optional
      case 3:
        if (formData.useExperienceBasedTailoring) {
          return formData.education && formData.fieldOfStudy;
        }
        return true; // Job description is optional
      case 4:
        return formData.internshipDurationWeeks && 
               formData.internshipDurationWeeks >= 6 && 
               formData.internshipDurationWeeks <= 12;
      default:
        return false;
    }
  };

  // Debug current state - moved to useEffect to prevent constant re-renders
  useEffect(() => {
    console.log('=== FORM STATE DEBUG ===');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    console.log('Can proceed:', canProceedToNext());
    console.log('Is generating:', isGenerating);
    console.log('=== END FORM STATE DEBUG ===');
  }, [currentStep, formData, isGenerating]);

  const testButtonClick = () => {
    console.log('=== BUTTON CLICK TEST ===');
    console.log('Button clicked, but is it disabled?');
    console.log('canProceedToNext():', canProceedToNext());
    console.log('isGenerating:', isGenerating);
    console.log('currentStep:', currentStep);
    console.log('formData:', formData);
    console.log('=== END BUTTON TEST ===');
    
    // Now call the real handler
    handleGenerate();
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      
      // Additional immediate scroll to ensure it works
      setTimeout(() => {
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
      }, 150);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      
      // Additional immediate scroll to ensure it works
      setTimeout(() => {
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
      }, 150);
    }
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 60000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out - the function may be starting up. Please try again.');
      }
      throw error;
    }
  };

  const handleGenerate = async () => {
    console.log('=== HANDLE GENERATE CALLED ===');
    
    if (!canProceedToNext()) {
      console.log('=== VALIDATION FAILED ===');
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before generating your preview.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== VALIDATION PASSED ===');
    setIsGenerating(true);

    // Function to attempt the request
    const attemptRequest = async (attemptNumber: number): Promise<any> => {
      const supabaseUrl = "https://nhlsrtubyvggtkyrhkuu.supabase.co";
      const functionUrl = `${supabaseUrl}/functions/v1/generate-internship-preview`;
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHNydHVieXZnZ3RreXJoa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzM4OTUsImV4cCI6MjA1NDIwOTg5NX0.rD-VfZhrrSRpo1rfuO1JoKYkNELxUUGdulu4-sI-kdU";

      console.log(`=== ATTEMPT ${attemptNumber} ===`);
      console.log('Function URL:', functionUrl);
      console.log('Form data being sent:', JSON.stringify(formData, null, 2));

      // Use longer timeout based on complexity - job descriptions require more processing
      const hasJobDescription = formData.jobDescription && formData.jobDescription.trim().length > 0;
      const baseTimeout = hasJobDescription ? 120000 : 90000; // 2min for job desc, 1.5min without
      const timeoutMs = attemptNumber === 1 ? baseTimeout : Math.max(baseTimeout - 30000, 60000);
      
      const response = await fetchWithTimeout(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify(formData),
      }, timeoutMs);

      console.log(`Attempt ${attemptNumber} - Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${attemptNumber} failed:`, response.status, errorText);
        
        // If it's a timeout or cold start related error, we'll retry
        if (response.status === 504 || response.status === 408 || response.status === 503) {
          throw new Error(`RETRY_NEEDED:${response.status}:${errorText}`);
        }
        
        // For other errors, don't retry
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
    };

    try {
      let response;
      let lastError;
      const maxAttempts = 2;

      // Show different loading messages
      const updateLoadingMessage = (attemptNumber: number, isRetry: boolean = false) => {
        // You could update your loading overlay text here if needed
        console.log(isRetry ? 
          `Retrying... (Attempt ${attemptNumber}/${maxAttempts})` : 
          `Generating preview... (Attempt ${attemptNumber}/${maxAttempts})`
        );
      };

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          updateLoadingMessage(attempt, attempt > 1);
          response = await attemptRequest(attempt);
          break; // Success - exit retry loop
        } catch (error: any) {
          lastError = error;
          console.error(`Attempt ${attempt} failed:`, error.message);
          
          // Check if this is a retryable error
          if (error.message.startsWith('RETRY_NEEDED:') || 
              error.message.includes('timed out') ||
              error.message.includes('fetch')) {
            
            if (attempt < maxAttempts) {
              console.log(`Will retry in 2 seconds... (${maxAttempts - attempt} attempts remaining)`);
              
              // Show user we're retrying
              toast({
                title: "Retrying...",
                description: "The function is starting up. Retrying automatically...",
                duration: 2000,
              });
              
              // Wait 2 seconds before retry
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
          }
          
          // Non-retryable error or max attempts reached
          throw error;
        }
      }

      if (!response) {
        throw lastError || new Error('All attempts failed');
      }

      // Process successful response
      const resultText = await response.text();
      console.log('Success response text length:', resultText.length);
      
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate internship preview');
      }

      // Remove the success flag and metadata for the onComplete callback
      const { success, metadata, ...previewData } = result;
      
      onComplete(formData as InternshipPreviewData, previewData);
      
      toast({
        title: "Preview Generated!",
        description: "Your virtual internship preview is ready.",
        duration: 5000,
      });

    } catch (error: any) {
      console.error('=== FINAL ERROR HANDLER ===');
      console.error('Error:', error);
      
      let userMessage = "Failed to generate preview";
      let description = "Please try again.";
      
      if (error.message.includes('timed out')) {
        userMessage = "Request Timed Out";
        description = "The function is taking longer than expected. This often happens on the first try. Please click 'Generate Preview' again.";
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        userMessage = "Network Error";
        description = "Please check your internet connection and try again.";
      } else if (error.message.startsWith('HTTP 404')) {
        userMessage = "Function Not Found";
        description = "The preview generation service is not available. Please contact support.";
      } else if (error.message.startsWith('HTTP 403')) {
        userMessage = "Access Denied";
        description = "Authentication failed. Please refresh the page and try again.";
      } else if (error.message) {
        userMessage = error.message;
      }
      
      toast({
        title: userMessage,
        description: description,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IndustryStep 
            value={formData.industry || ''} 
            onChange={(industry) => updateFormData({ industry })} 
          />
        );
      case 2:
        return (
          <JobRoleStep 
            value={formData.jobRole || ''} 
            onChange={(jobRole) => updateFormData({ jobRole })} 
          />
        );
      case 3:
        return (
          <JobDescriptionStep 
            jobDescription={formData.jobDescription || ''}
            useExperienceBasedTailoring={formData.useExperienceBasedTailoring || false}
            education={formData.education || ''}
            fieldOfStudy={formData.fieldOfStudy || ''}
            experienceYears={formData.experienceYears || 0}
            certifications={formData.certifications || []}
            skills={formData.skills || []}
            careerGoal={formData.careerGoal || ''}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <DurationStep 
            value={formData.internshipDurationWeeks || 8} 
            onChange={(internshipDurationWeeks) => updateFormData({ internshipDurationWeeks })} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Loading Overlay - Fixed positioning to center on viewport */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4 max-w-md mx-auto p-8">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Creating Your Virtual Internship Preview
              </h3>
              <p className="text-gray-600 text-sm">
                {(() => {
                  const hasJobDescription = formData.jobDescription && formData.jobDescription.trim().length > 0;
                  const baseMessage = hasJobDescription 
                    ? 'Our AI is generating a personalized company profile and task schedule specifically tailored to your job description. This usually takes about 1.5-2 minutes due to the custom analysis required.'
                    : 'Our AI is generating a personalized company profile, virtual supervisor, and task schedule tailored to your preferences. This usually takes about 1-2 minutes.';
                  
                  if (currentAttempt === 0 || currentAttempt === 1) {
                    return baseMessage;
                  } else if (currentAttempt === 2) {
                    return hasJobDescription 
                      ? 'The serverless function is warming up. Job description analysis requires additional processing time, so this may take up to 2.5 minutes.'
                      : 'The serverless function is warming up. This is normal on the first request and usually resolves quickly, but may take up to 2 minutes.';
                  } else {
                    return 'This is taking longer than usual, but we\'re working hard to get your preview ready. Please be patient.';
                  }
                })()}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 text-xs">
                💡 Tip: We're creating realistic tasks that can be completed entirely online through text submissions.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card ref={formRef} className="relative bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-semibold">
              Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isGenerating}
              className={`flex items-center gap-2 ${
                currentStep === totalSteps 
                  ? 'text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 min-w-[90px] sm:min-w-[110px]' 
                  : ''
              }`}
            >
              <ArrowLeft className={`${currentStep === totalSteps ? 'h-3 w-3 sm:h-4 sm:w-4' : 'h-4 w-4'}`} />
              <span className="whitespace-nowrap">Previous</span>
            </Button>

            <div className={`flex items-center gap-2 ${
              currentStep === totalSteps 
                ? 'mx-4 sm:mx-8 md:mx-12' 
                : ''
            }`}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 <= currentStep ? 'bg-amber-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext() || isGenerating}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={testButtonClick}
                disabled={!canProceedToNext() || isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 min-w-[130px] sm:min-w-[160px]"
                onMouseEnter={() => console.log('=== GENERATE BUTTON HOVER ===', 'Disabled:', !canProceedToNext() || isGenerating, 'Can proceed:', canProceedToNext(), 'Is generating:', isGenerating)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="whitespace-nowrap">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">Generate Preview</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            margin: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
