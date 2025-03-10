
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const PasswordCollapsible = ({ trigger, children }: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <Button
        variant="ghost" 
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {trigger}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
