
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TutorHeaderProps {
  activeStep: number;
  totalSteps: number;
  title: string;
  toggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  children?: React.ReactNode;
}

export const TutorHeader = ({
  activeStep,
  totalSteps,
  title,
  toggleSidebar,
  showSidebarToggle = false,
  children
}: TutorHeaderProps) => {
  const navigate = useNavigate();
  const progress = Math.round((activeStep / totalSteps) * 100);

  return (
    <motion.div 
      className="py-3 px-4 border-b flex items-center justify-between bg-card"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {showSidebarToggle && toggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="touch-manipulation"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="gap-1 h-8 touch-manipulation"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="ml-1">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={progress} className="h-1.5 w-24 sm:w-32" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
      </div>
      
      <div>
        {children}
      </div>
    </motion.div>
  );
};
