
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function CourseGuide() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Only show the guide on the dashboard page
  const isDashboardPage = location.pathname === "/dashboard";
  
  useEffect(() => {
    // Only proceed if we have a logged-in user and we're on the dashboard
    if (!user || !isDashboardPage) return;

    const checkGuideStatus = async () => {
      try {
        // Check if onboarding is complete and guide hasn't been shown
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_complete, course_guide_completed')
          .eq('id', user.id)
          .single();
            
        if (error) throw error;
        
        // Show guide if onboarding is complete but guide hasn't been shown yet
        if (profile?.onboarding_complete && !profile?.course_guide_completed) {
          setVisible(true);
        }
      } catch (error) {
        console.error("Error checking guide status:", error);
      }
    };

    checkGuideStatus();
  }, [user, isDashboardPage]);

  const handleComplete = () => {
    if (!user) return;
    
    // Update the database to mark the guide as completed
    updateGuideCompletionStatus();
    setVisible(false);
    navigate("/courses");
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    // Update the database to mark the guide as completed
    updateGuideCompletionStatus();
    setVisible(false);
  };
  
  const updateGuideCompletionStatus = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ course_guide_completed: true })
        .eq('id', user.id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Failed to update guide completion status:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!visible || !isDashboardPage) return null;

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
