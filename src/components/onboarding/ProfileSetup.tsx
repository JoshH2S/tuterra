
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ProfileProgress } from "./ProfileProgress";
import { ProfileStepContent } from "./ProfileStepContent";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
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
  } = useProfileSetup(onComplete);

  return (
    <div className="h-full flex flex-col">
      {/* Header with progress */}
      <div className="px-4 py-5 sm:px-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Build Your Profile</h2>
          <div className="text-sm text-gray-500">Step {step} of {totalSteps}</div>
        </div>
        
        {/* Progress bar with animation */}
        <div className="h-2 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-grow p-4 overflow-y-auto">
        <ProfileStepContent
          step={step}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          educationLevel={educationLevel}
          setEducationLevel={setEducationLevel}
        />
      </div>
      
      {/* Footer with navigation buttons and progress visualization */}
      <div className="p-4 border-t bg-gray-50 sm:px-6">
        <div className="flex flex-col space-y-4">
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
          
          {/* Privacy policy text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              <PrivacyPolicyLink className="text-xs text-primary hover:underline cursor-pointer" linkText="View our Privacy Policy" /> to learn how we handle your data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
