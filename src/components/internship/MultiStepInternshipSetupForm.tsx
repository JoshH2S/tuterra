import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Lock, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePromotionalInternships } from "@/hooks/usePromotionalInternships";
import { supabase } from "@/integrations/supabase/client";
import { InternshipIndustryStep } from "./setup-steps/InternshipIndustryStep";
import { InternshipRoleStep } from "./setup-steps/InternshipRoleStep";
import { InternshipDescriptionStep } from "./setup-steps/InternshipDescriptionStep";
import { InternshipDurationStep } from "./setup-steps/InternshipDurationStep";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";

export interface InternshipFormData {
  industry: string;
  jobTitle: string;
  jobDescription: string;
  durationWeeks: number;
  startDate: string;
}

export function MultiStepInternshipSetupForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { status, decrementPromotionalInternship } = usePromotionalInternships();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<InternshipFormData>>({
    industry: "",
    jobTitle: "",
    jobDescription: "",
    durationWeeks: 6,
    startDate: today
  });

  const totalSteps = 4;
  const stepProgress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Select Industry",
    "Job Title", 
    "Job Description",
    "Duration & Start Date"
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

  const updateFormData = (data: Partial<InternshipFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.industry && formData.industry.trim().length > 0;
      case 2:
        return formData.jobTitle && formData.jobTitle.trim().length > 0;
      case 3:
        return formData.jobDescription && formData.jobDescription.trim().length >= 20;
      case 4:
        return formData.durationWeeks && formData.durationWeeks > 0 && formData.startDate;
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an internship",
        variant: "destructive",
      });
      return;
    }

    // NEW ACCESS CHECK: Pro/Premium OR has promotional internships
    const hasAccess = 
      subscription.tier === "pro" || 
      subscription.tier === "premium" || 
      status.hasPromotionalInternships;

    if (!hasAccess) {
      setShowUpgradePrompt(true);
      return;
    }

    if (!canProceedToNext()) {
      toast({
        title: "Please complete all fields",
        description: "Fill in all required information before creating your internship.",
        variant: "destructive",
      });
      return;
    }

    const isPromotional = status.hasPromotionalInternships && subscription.tier === "free";

    setIsGenerating(true);
    setGenerationProgress(10);
    
    // Add max retries for 500 errors
    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxRetries) {
      try {
        // Show initial toast on first attempt
        if (attempt === 0) {
          toast({
            title: "Creating your internship...",
            description: "Setting up your virtual internship experience. This might take a minute.",
          });
        } else {
          toast({
            title: `Retrying (${attempt}/${maxRetries})...`,
            description: "Previous attempt encountered an error. Retrying...",
          });
        }
        
        setGenerationProgress(30);

        // Get the session JWT for auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session found");
        }

        // Use the edge function to create the internship
        const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            job_title: formData.jobTitle,
            industry: formData.industry,
            job_description: formData.jobDescription,
            duration_weeks: formData.durationWeeks,
            start_date: formData.startDate,
            is_promotional: isPromotional,  // ADD THIS
            promo_code: status.promoCodeUsed  // ADD THIS
          })
        });

        setGenerationProgress(70);

        // Parse response
        const result = await response.json();
        
        // Check if we should retry (only for 500 errors which might be temporary)
        if (!response.ok && response.status === 500) {
          lastError = new Error(result.error || result.details || "Server error");
          console.warn(`Attempt ${attempt + 1} failed with 500 error:`, result);
          
          // Increment attempt and retry after delay if not the last attempt
          attempt++;
          if (attempt < maxRetries) {
            const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue; // Skip to the next attempt
          } else {
            // We've exhausted retries, throw the last error
            throw lastError;
          }
        }
        
        // Handle other errors (non-500)
        if (!response.ok) {
          // More detailed error handling based on status code
          if (response.status === 400) {
            throw new Error(result.details || "Invalid input. Please check your form values.");
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please sign in again.");
          } else {
            throw new Error(result.error || result.details || "Failed to create internship");
          }
        }
        
        if (!result.success) {
          // Handle a valid response that indicates failure
          console.warn("API returned failure:", result);
          throw new Error(result.error || result.details || "Failed to create internship");
        }

        // If we reach here, the request was successful
        setGenerationProgress(100);

        // After successful creation, decrement promotional counter
        if (isPromotional) {
          await decrementPromotionalInternship();
          
          // Schedule feedback reminder
          try {
            await supabase.rpc('schedule_feedback_reminder', {
              p_user_id: user.id,
              p_session_id: result.sessionId,
              p_days_delay: 30
            });
          } catch (reminderError) {
            console.error('Failed to schedule feedback reminder:', reminderError);
            // Don't fail the request
          }
        }
        
        toast({
          title: "Internship Created!",
          description: isPromotional 
            ? "Your promotional virtual internship has been set up successfully!"
            : "Your virtual internship has been set up successfully.",
        });
        
        // Add haptic feedback for mobile devices if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
        
        // Navigate to the internship dashboard
        navigate(`/dashboard/virtual-internship?sessionId=${result.sessionId}`, { 
          state: { newInternship: true } 
        });
        
        // Exit the retry loop on success
        break;
      } catch (error: any) {
        lastError = error;
        
        // Only increment attempt for 500 errors (handled above)
        // For other errors, we'll exit immediately
        if (attempt === maxRetries - 1 || !lastError || lastError.message !== "Server error") {
          console.error("Error creating internship:", error);
          toast({
            title: "Failed to create internship",
            description: error.message || "There was an error setting up your internship.",
            variant: "destructive",
          });
          break;
        }
      }
    }
    
    // Always clean up
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <InternshipIndustryStep 
            value={formData.industry || ''} 
            onChange={(industry) => updateFormData({ industry })} 
          />
        );
      case 2:
        return (
          <InternshipRoleStep 
            value={formData.jobTitle || ''} 
            onChange={(jobTitle) => updateFormData({ jobTitle })} 
          />
        );
      case 3:
        return (
          <InternshipDescriptionStep 
            value={formData.jobDescription || ''}
            onChange={(jobDescription) => updateFormData({ jobDescription })} 
          />
        );
      case 4:
        return (
          <InternshipDurationStep 
            durationWeeks={formData.durationWeeks || 6}
            startDate={formData.startDate || today}
            onChange={(data) => updateFormData(data)} 
          />
        );
      default:
        return null;
    }
  };

  const showProgress = isGenerating && generationProgress > 0;

  // Show promotional banner if user has promotional internships
  if (status.hasPromotionalInternships && !subscriptionLoading) {
    return (
      <React.Fragment>
        {/* Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
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
                      Creating Your Promotional Internship
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Our AI is setting up your free virtual internship experience...
                    </p>
                  </div>

                  {showProgress ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
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
                    This may take a moment as we create your personalized internship experience.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Promotional Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-amber-600" />
              <span className="font-bold text-lg text-amber-900">
                🎉 FIRST30 Promotion Active!
              </span>
            </div>
            <p className="text-sm text-amber-800 mb-2">
              You have <strong>{status.internshipsRemaining} free virtual internship{status.internshipsRemaining > 1 ? 's' : ''}</strong> available.
            </p>
            {status.feedbackConsent && (
              <p className="text-xs text-amber-700">
                📧 We'll send you a feedback survey after you complete your internship. Thank you for helping us improve!
              </p>
            )}
          </div>
          
          {/* Render normal form */}
          <Card className="w-full shadow-xl bg-white/95 backdrop-blur-md border border-white/20">
            {/* ... rest of the form content ... */}
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
                Create Your Virtual Internship
              </CardTitle>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Set up a personalized internship experience in just a few steps
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
                    onClick={() => navigate("/dashboard/virtual-internship/overview")}
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
                      disabled={!canProceedToNext() || isGenerating}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create Promotional Internship
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

  // Show upgrade prompt for free users WITHOUT promotional access
  const isFreeTier = subscription.tier === "free" && !status.hasPromotionalInternships;

  if (isFreeTier && !subscriptionLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Virtual Internships Require Pro or Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              Get hands-on experience with realistic workplace scenarios, AI-powered supervision, 
              and personalized feedback to build your professional skills.
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-gray-900 mb-2">What you'll get with Pro/Premium:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Unlimited virtual internship experiences</li>
                <li>• AI supervisor with personalized feedback</li>
                <li>• Real-world projects and tasks</li>
                <li>• Professional skill development</li>
                <li>• Certificate of completion</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate("/internship-preview")}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Try Preview First
              </Button>
              <Button 
                onClick={() => navigate("/pricing")}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="text-gray-500"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>

        <UpgradePrompt 
          isOpen={showUpgradePrompt} 
          onClose={() => setShowUpgradePrompt(false)} 
          featureType="assessment"
        />
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
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
                    Creating Your Internship
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our AI is setting up your virtual internship experience...
                  </p>
                </div>

                {showProgress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
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
                  This may take a moment as we create your personalized internship experience.
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
              Create Your Virtual Internship
            </CardTitle>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Set up a personalized internship experience in just a few steps
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
                  onClick={() => navigate("/dashboard/virtual-internship/overview")}
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
                    disabled={!canProceedToNext() || isGenerating}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Internship
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

