
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MobileTabHeaderProps {
  activeView: 'summary' | 'questions' | 'analysis';
  handleViewChange: (view: 'summary' | 'questions' | 'analysis') => void;
}

export const MobileTabHeader = ({ 
  activeView, 
  handleViewChange 
}: MobileTabHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
      <motion.div className="flex justify-between w-full relative">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewChange('summary')}
          className={activeView === 'summary' ? "text-primary" : "text-muted-foreground"}
        >
          Summary
          {activeView === 'summary' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
              layoutId="underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewChange('questions')}
          className={activeView === 'questions' ? "text-primary" : "text-muted-foreground"}
        >
          Questions
          {activeView === 'questions' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
              layoutId="underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewChange('analysis')}
          className={activeView === 'analysis' ? "text-primary" : "text-muted-foreground"}
        >
          Analysis
          {activeView === 'analysis' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
              layoutId="underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Button>
      </motion.div>
    </div>
  );
};
