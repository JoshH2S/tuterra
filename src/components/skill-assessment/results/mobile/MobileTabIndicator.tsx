
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileTabIndicatorProps {
  activeView: 'summary' | 'questions' | 'analysis';
  handleViewChange: (view: 'summary' | 'questions' | 'analysis') => void;
}

export const MobileTabIndicator = ({
  activeView,
  handleViewChange
}: MobileTabIndicatorProps) => {
  return (
    <motion.div 
      className="flex justify-between mt-6 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div 
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            if (activeView === 'questions') handleViewChange('summary');
            else if (activeView === 'analysis') handleViewChange('questions');
          }}
          disabled={activeView === 'summary'}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </motion.div>
      
      <div className="flex gap-1">
        <motion.span 
          className={`h-2 w-2 rounded-full ${activeView === 'summary' ? 'bg-primary' : 'bg-gray-300'}`}
          animate={{ scale: activeView === 'summary' ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        ></motion.span>
        <motion.span 
          className={`h-2 w-2 rounded-full ${activeView === 'questions' ? 'bg-primary' : 'bg-gray-300'}`}
          animate={{ scale: activeView === 'questions' ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        ></motion.span>
        <motion.span 
          className={`h-2 w-2 rounded-full ${activeView === 'analysis' ? 'bg-primary' : 'bg-gray-300'}`}
          animate={{ scale: activeView === 'analysis' ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        ></motion.span>
      </div>
      
      <motion.div 
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            if (activeView === 'summary') handleViewChange('questions');
            else if (activeView === 'questions') handleViewChange('analysis');
          }}
          disabled={activeView === 'analysis'}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
