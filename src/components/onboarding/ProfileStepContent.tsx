
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";
import { TopicsSelection } from "./TopicsSelection";
import { EducationLevelSelector } from "./EducationLevelSelector";
import { ProfileSetupHeader } from "./ProfileSetupHeader";

interface ProfileStepContentProps {
  step: number;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  educationLevel: string;
  setEducationLevel: (level: string) => void;
}

export const ProfileStepContent = ({
  step,
  selectedTopics,
  setSelectedTopics,
  educationLevel,
  setEducationLevel
}: ProfileStepContentProps) => {
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
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
            <ProfileSetupHeader
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              title="Select Topics of Interest"
              description="These preferences will help us tailor your experience with relevant news articles and learning materials."
            />
            <TopicsSelection 
              selectedTopics={selectedTopics} 
              setSelectedTopics={setSelectedTopics} 
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="flex flex-col h-full">
            <ProfileSetupHeader
              icon={<GraduationCap className="h-5 w-5 text-primary" />}
              title="Set Education Level"
              description="Your education level will help us set a default difficulty for quizzes and assessments."
            />
            <EducationLevelSelector
              selected={educationLevel}
              onSelect={setEducationLevel}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
