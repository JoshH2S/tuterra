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
        "bg-[#0d1b35]",
        "border-r border-white/5",
        "shadow-[2px_0_16px_0_rgba(0,0,0,0.25)]",
        "transition-all duration-300 ease-in-out z-30",
        "w-[200px]"
      )}>
        <SidebarHeader className="relative">
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center px-5 py-5"
          >
            <Link to="/" className="flex items-center">
              <img
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                alt="tuterra.ai"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col justify-between h-[calc(100vh-72px)]">
          <SidebarNavigation isCollapsed={false} />
        </SidebarContent>

        <SidebarFooter className="border-t border-white/8 p-2">
          <SidebarUserProfile isCollapsed={false} />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};
