
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ProfileProgress } from "./ProfileProgress";
import { ProfileStepContent } from "./ProfileStepContent";
import { WelcomeStep } from "./WelcomeStep";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const navigate = useNavigate();
  const {
    step,
    totalSteps,
    selectedTopics,
    setSelectedTopics,
    educationLevel,
    setEducationLevel,
    isSubmitting,
    handleNext,
    handleBack,
    getProgressPercentage,
    getProgressMessage,
    isCurrentStepValid,
    handleComplete
  } = useProfileSetup(() => {
    onComplete();
    navigate("/pricing", { replace: true });
  });

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col">
        {step === 0 ? (
          <WelcomeStep onStart={handleNext} />
        ) : (
          <>
            <div className="px-4 py-5 sm:px-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Build Your Profile</h2>
                <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>
              </div>
              
              <div className="h-2 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
              <ProfileStepContent
                step={step}
                selectedTopics={selectedTopics}
                setSelectedTopics={setSelectedTopics}
                educationLevel={educationLevel}
                setEducationLevel={setEducationLevel}
              />
            </div>
            
            <div className="p-4 border-t bg-gray-50 sm:px-6">
              <ProfileProgress 
                progressPercentage={getProgressPercentage()}
                progressMessage={getProgressMessage()}
                step={step}
                totalSteps={totalSteps}
                isCurrentStepValid={isCurrentStepValid()}
                isSubmitting={isSubmitting}
                onBack={handleBack}
                onNext={handleNext}
                onComplete={handleComplete}
              />
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};
