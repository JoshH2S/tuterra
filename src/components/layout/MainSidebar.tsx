
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarUserProfile } from "./sidebar/SidebarUserProfile";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const MainSidebar = () => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Hide sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      // Mobile-specific logic can remain
    }
  }, [isMobile]);

  // Return null on mobile devices to hide the sidebar completely
  if (isMobile) {
    return null;
  }

  return (
    <div ref={sidebarRef} className="relative flex">
      <Sidebar className={cn(
        "fixed left-0 top-0 h-screen",
        "bg-gradient-to-br from-primary-100/80 to-primary-200/80 dark:bg-slate-800", 
        "border-r border-gray-200 dark:border-gray-800",
        "shadow-[1px_0_5px_0_rgba(0,0,0,0.05)]",
        "transition-all duration-300 ease-in-out z-30",
        "w-[200px]" // Fixed width, no more collapsed state
      )}>
        <SidebarHeader className="relative">
          <motion.div 
            key="logo" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center p-4"
          >
            <Link to="/" className="flex items-center">
              <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">tuterra.ai</span>
            </Link>
          </motion.div>
        </SidebarHeader>
        
        <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
          <SidebarNavigation isCollapsed={false} />
        </SidebarContent>

        {/* Move the user profile to the sidebar footer */}
        <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-2">
          <SidebarUserProfile isCollapsed={false} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};
