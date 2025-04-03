
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarUserProfile } from "./sidebar/SidebarUserProfile";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const MainSidebar = () => {
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Hide sidebar on mobile by default
  useEffect(() => {
    if (isMobile && state !== "collapsed") {
      toggleSidebar();
    }
  }, [isMobile, toggleSidebar, state]);

  // Handle touch gestures for mobile
  useEffect(() => {
    if (!isMobile || !sidebarRef.current) return;
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!sidebarRef.current) return;
      const touchCurrentX = e.touches[0].clientX;
      const diff = touchStartX - touchCurrentX;

      // Swipe left to collapse
      if (diff > 50 && !isCollapsed) {
        toggleSidebar();
      }
      // Swipe right to expand
      else if (diff < -50 && isCollapsed) {
        toggleSidebar();
      }
    };
    const element = sidebarRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isCollapsed, toggleSidebar]);

  // Return null on mobile devices to hide the sidebar completely
  if (isMobile) {
    return null;
  }
  
  return (
    <div ref={sidebarRef} className="relative flex group/sidebar">
      {/* Expand/collapse toggle button */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "absolute top-4 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all touch-manipulation",
          isCollapsed ? "right-[-12px]" : "right-4"
        )}
        onClick={toggleSidebar} 
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </motion.button>
      
      <Sidebar className={cn(
        "transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800",
        isCollapsed ? "w-[60px]" : "w-[220px]"
      )}>
        <SidebarHeader className="relative border-b border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div 
                key="logo" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="flex items-center p-4"
              >
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
                    tuterra.ai
                  </span>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-small" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="flex justify-center items-center p-4"
              >
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
                    E
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarHeader>
        
        <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
          <SidebarNavigation isCollapsed={isCollapsed} />
          <SidebarUserProfile isCollapsed={isCollapsed} />
        </SidebarContent>
      </Sidebar>
    </div>
  );
};
