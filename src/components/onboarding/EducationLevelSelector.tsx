
import { Check, GraduationCap, BookOpen, Award, Briefcase, School } from "lucide-react";
import { motion } from "framer-motion";

const EDUCATION_LEVELS = [
  { 
    id: 'high_school', 
    label: 'High School', 
    description: 'Secondary education',
    icon: <School className="h-5 w-5 text-primary" /> 
  },
  { 
    id: 'undergraduate', 
    label: 'Undergraduate', 
    description: 'Bachelor\'s degree or equivalent',
    icon: <BookOpen className="h-5 w-5 text-primary" /> 
  },
  { 
    id: 'graduate', 
    label: 'Graduate', 
    description: 'Master\'s or doctorate level',
    icon: <GraduationCap className="h-5 w-5 text-primary" /> 
  },
  { 
    id: 'professional', 
    label: 'Professional', 
    description: 'Specialized career training',
    icon: <Briefcase className="h-5 w-5 text-primary" /> 
  },
  { 
    id: 'continuing_education', 
    label: 'Continuing Education', 
    description: 'Ongoing professional development',
    icon: <Award className="h-5 w-5 text-primary" /> 
  },
];

interface EducationLevelSelectorProps {
  selected: string;
  onSelect: (level: string) => void;
}

export const EducationLevelSelector = ({ selected, onSelect }: EducationLevelSelectorProps) => {
  return (
    <div className="space-y-3">
      {EDUCATION_LEVELS.map((level) => (
        <motion.div
          key={level.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all
            ${selected === level.id 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 bg-white'}
            touch-manipulation
          `}
          onClick={() => onSelect(level.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {level.icon}
            </div>
            <div className="flex-grow">
              <span className="font-medium text-gray-900">{level.label}</span>
              <p className="text-sm text-gray-500 mt-0.5">{level.description}</p>
            </div>
            {selected === level.id && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0"
              >
                <Check className="h-4 w-4" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
