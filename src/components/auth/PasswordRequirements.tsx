
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validatePasswordRequirements } from '@/lib/password';

export const PasswordRequirements = ({ password }: { password: string }) => {
  const { requirements } = validatePasswordRequirements(password);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 text-sm"
    >
      <p className="font-medium text-muted-foreground mb-2">
        Password must contain:
      </p>
      <div className="space-y-2">
        {requirements.map((req) => (
          <RequirementItem
            key={req.id}
            met={req.validator(password)}
            label={req.label}
          />
        ))}
      </div>
    </motion.div>
  );
};

const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
  <motion.div
    initial={false}
    animate={{ 
      color: met ? 'var(--success, #10b981)' : 'var(--muted-foreground)' 
    }}
    className="flex items-center gap-2"
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={met ? 'check' : 'x'}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="flex items-center justify-center"
      >
        {met ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </motion.div>
    </AnimatePresence>
    <span>{label}</span>
  </motion.div>
);
