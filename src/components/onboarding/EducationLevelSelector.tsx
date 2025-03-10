
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const EDUCATION_LEVELS = [
  { id: 'high_school', label: 'High School', description: 'Secondary education' },
  { id: 'undergraduate', label: 'Undergraduate', description: 'Bachelor\'s degree or equivalent' },
  { id: 'graduate', label: 'Graduate', description: 'Master\'s or doctorate level' },
  { id: 'professional', label: 'Professional', description: 'Specialized career training' },
  { id: 'continuing_education', label: 'Continuing Education', description: 'Ongoing professional development' },
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
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 hover:border-gray-300 bg-white'}
          `}
          onClick={() => onSelect(level.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{level.label}</span>
              <span className="text-sm text-gray-500">{level.description}</span>
            </div>
            {selected === level.id && (
              <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
