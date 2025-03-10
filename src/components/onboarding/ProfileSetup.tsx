
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, GraduationCap, BookOpen, Trophy } from "lucide-react";
import { TopicsSelection } from "./TopicsSelection";
import { EducationLevelSelector } from "./EducationLevelSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";

// Define the specific news topic types from the Supabase database
type NewsTopic = Database["public"]["Enums"]["news_topic"];

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getProgressPercentage = () => {
    let percentage = ((step - 1) / totalSteps) * 100;
    
    // Add additional progress based on selections in current step
    if (step === 1 && selectedTopics.length > 0) {
      percentage += (1 / totalSteps) * (selectedTopics.length > 3 ? 100 : (selectedTopics.length / 3) * 100);
    } else if (step === 2 && educationLevel) {
      percentage += (1 / totalSteps) * 100;
    }
    
    return Math.min(percentage, 100);
  };

  const getProgressMessage = () => {
    const progressPercentage = getProgressPercentage();
    
    if (progressPercentage < 30) return "Just getting started";
    if (progressPercentage < 60) return "Making progress";
    if (progressPercentage < 90) return "Almost there";
    return "Ready to complete!";
  };

  const isCurrentStepValid = () => {
    if (step === 1) return selectedTopics.length > 0;
    if (step === 2) return !!educationLevel;
    return false;
  };

  const handleComplete = async () => {
    if (!educationLevel) {
      toast({
        title: "Please select an education level",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // We need to add an education_level column to the profiles table
        // Since it doesn't exist yet, let's use a custom column in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            // Instead of education_level, store it in another available field like 'school'
            school: educationLevel,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Save topics preferences if any are selected
        if (selectedTopics.length > 0) {
          // Convert string[] to the required news_topic[] enum type
          const typedTopics = selectedTopics.filter(topic => 
            [
              'business_economics',
              'political_science_law',
              'science_technology',
              'healthcare_medicine',
              'engineering_applied_sciences',
              'arts_humanities_social_sciences',
              'education',
              'mathematics_statistics',
              'industry_specific',
              'cybersecurity_it'
            ].includes(topic)
          ) as NewsTopic[];

          const { error: topicsError } = await supabase
            .from('user_news_preferences')
            .upsert({
              user_id: user.id,
              topics: typedTopics,
            });

          if (topicsError) throw topicsError;
        }

        toast({
          title: "Profile setup complete!",
          description: "Your preferences have been saved.",
        });

        onComplete();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

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
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariants}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            {step === 1 && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Select Topics of Interest</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  These preferences will help us tailor your experience with relevant news articles and learning materials.
                </p>
                <TopicsSelection 
                  selectedTopics={selectedTopics} 
                  setSelectedTopics={setSelectedTopics} 
                />
              </div>
            )}
            
            {step === 2 && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Set Education Level</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Your education level will help us set a default difficulty for quizzes and assessments.
                </p>
                <EducationLevelSelector
                  selected={educationLevel}
                  onSelect={setEducationLevel}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer with navigation buttons and progress visualization */}
      <div className="p-4 border-t bg-gray-50 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CircularProgress 
              percentage={getProgressPercentage()} 
              size={44} 
              strokeWidth={5}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{getProgressMessage()}</p>
              <p className="text-xs text-gray-500">{Math.round(getProgressPercentage())}% complete</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {step > 1 ? (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="gap-1 min-w-[90px]"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div></div> // Empty div to maintain layout
            )}
            
            {step < totalSteps ? (
              <Button 
                onClick={handleNext}
                className="gap-1 min-w-[90px]"
                disabled={!isCurrentStepValid()}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                className="gap-1 min-w-[120px]"
                disabled={isSubmitting || !isCurrentStepValid()}
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>Complete <Check className="h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
