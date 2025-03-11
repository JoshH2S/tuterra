
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const CourseTip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Show the tooltip after a short delay when the component mounts
    const tipTimer = setTimeout(() => {
      const tipShown = localStorage.getItem("course_tip_shown");
      if (!tipShown) {
        setIsVisible(true);
        setHasBeenShown(true);
        localStorage.setItem("course_tip_shown", "true");
      }
    }, 1000);

    return () => clearTimeout(tipTimer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed left-[220px] top-[180px] z-50 pointer-events-none"
    >
      <div className="relative">
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs pointer-events-auto">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">Get Started with Courses</h4>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Start by creating your first course to organize your learning materials and quizzes.
          </p>
          <Button 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              window.location.href = "/courses";
              handleDismiss();
            }}
          >
            Create Your First Course
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
