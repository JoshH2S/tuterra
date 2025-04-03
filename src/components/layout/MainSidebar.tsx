
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

  return <div ref={sidebarRef} className="relative flex">
      {/* Add a fixed toggle button for collapsed state */}
      {isCollapsed && <motion.button initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="absolute left-[calc(50px+4px)] top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all touch-manipulation" onClick={toggleSidebar} aria-label="Expand sidebar">
          <ChevronRight size={18} />
        </motion.button>}
      
      <Sidebar className={cn(
        "fixed left-0 top-0 h-screen",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
        "border-r border-gray-200 dark:border-gray-800",
        "shadow-[1px_0_5px_0_rgba(0,0,0,0.05)]",
        "transition-all duration-300 ease-in-out z-30",
        isCollapsed ? "w-[50px]" : "w-[200px]"
      )}>
        <SidebarHeader className="relative">
          <AnimatePresence mode="wait">
            {!isCollapsed ? <motion.div key="logo" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="flex items-center p-4">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">tuterra.ai</span>
                </Link>
              </motion.div> : <motion.div key="logo-small" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="flex justify-center items-center p-4">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">E</span>
                </Link>
              </motion.div>}
          </AnimatePresence>
          
          {!isCollapsed && <motion.button className="absolute right-2 top-4 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation" whileTap={{
          scale: 0.9
        }} onClick={toggleSidebar} aria-label="Collapse sidebar">
              <AnimatePresence mode="wait">
                <motion.div key="chevron" initial={{
              opacity: 0,
              rotate: 90
            }} animate={{
              opacity: 1,
              rotate: 0
            }} exit={{
              opacity: 0,
              rotate: -90
            }} transition={{
              duration: 0.2
            }}>
                  <ChevronLeft size={18} />
                </motion.div>
              </AnimatePresence>
            </motion.button>}
        </SidebarHeader>
        
        <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
          <SidebarNavigation isCollapsed={isCollapsed} />
          <SidebarUserProfile isCollapsed={isCollapsed} />
        </SidebarContent>
      </Sidebar>
    </div>;
};
