
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StrengthLevel {
  label: string;
  color: string;
  textColor: string;
  minScore: number;
}

const strengthLevels: StrengthLevel[] = [
  { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500', minScore: 0 },
  { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500', minScore: 20 },
  { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500', minScore: 40 },
  { label: 'Good', color: 'bg-green-500', textColor: 'text-green-500', minScore: 60 },
  { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', minScore: 80 }
];

export const PasswordStrengthMeter = ({ 
  password,
  strength 
}: { 
  password: string;
  strength: number;
}) => {
  // Find the current strength level based on the score
  const currentLevel = strengthLevels
    .slice()
    .reverse()
    .find(level => strength >= level.minScore) || strengthLevels[0];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className={cn(
          "font-medium",
          currentLevel.textColor
        )}>
          {currentLevel.label}
        </span>
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full", currentLevel.color)}
          initial={{ width: '0%' }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};
