
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function CourseGuide() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Only proceed if we have a logged-in user
    if (!user) return;

    const checkOnboardingStatus = async () => {
      try {
        // First check local storage as a quick way to avoid unnecessary API calls
        const isLocallyComplete = localStorage.getItem("onboardingComplete") === "true";
        
        if (!isLocallyComplete) {
          // If not found in localStorage, check the database
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          // If complete in the database, set the local storage flag
          if (profile?.onboarding_complete) {
            localStorage.setItem("onboardingComplete", "true");
          }
          
          // Check if guide has been shown
          const isCourseGuideComplete = localStorage.getItem("courseGuideCompleted") === "true";
          
          // Show guide if onboarding is complete but guide hasn't been shown yet
          if (profile?.onboarding_complete && !isCourseGuideComplete) {
            setVisible(true);
          }
        } else {
          // Onboarding is complete locally, check if guide has been shown
          const isCourseGuideComplete = localStorage.getItem("courseGuideCompleted") === "true";
          
          // Show guide if onboarding is complete but guide hasn't been shown yet
          if (!isCourseGuideComplete) {
            setVisible(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleComplete = () => {
    localStorage.setItem("courseGuideCompleted", "true");
    setVisible(false);
    navigate("/courses");
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("courseGuideCompleted", "true");
    setVisible(false);
  };

  if (!visible) return null;

  // Position tooltip in a mobile-friendly way when the sidebar might be hidden
  const isSidebarVisible = document.querySelector('[data-sidebar="sidebar"]');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={handleDismiss}
        aria-label="Dismiss onboarding guide"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`fixed ${isSidebarVisible ? 'left-[220px]' : 'left-8'} top-[100px] z-[61] max-w-[280px]`}
      >
        <div className="relative bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 border border-primary">
          <button 
            onClick={handleDismiss}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="font-semibold mb-2 text-primary">Start Your Journey!</div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Begin by creating your first course - it's the foundation for everything else in Tuterra.
          </p>
          
          <div className="flex items-center gap-3">
            <Button onClick={handleComplete} className="bg-primary hover:bg-primary/90">
              Go to Courses
            </Button>
            <button
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
