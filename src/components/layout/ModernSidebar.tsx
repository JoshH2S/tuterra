import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { navigationItems } from "@/components/layout/sidebar/SidebarNavigation";
import { NavItem } from "@/components/layout/sidebar/NavItem";
import { TeamSwitcher } from "@/components/layout/sidebar/TeamSwitcher";
import { SidebarUserProfile } from "@/components/layout/sidebar/SidebarUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";

export function ModernSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState<string>("");
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Set active item based on current route
  useEffect(() => {
    const pathSegment = location.pathname.split("/")[1] || "dashboard";
    setActiveItem(pathSegment);
  }, [location]);

  // Handle hover events for desktop
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsCollapsed(true);
    }
  };

  // Handle touch events for mobile
  useEffect(() => {
    if (isMobile || !sidebarRef.current) return;
    
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
        setIsCollapsed(true);
      }
      // Swipe right to expand
      else if (diff < -50 && isCollapsed) {
        setIsCollapsed(false);
      }
    };
    
    const element = sidebarRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isCollapsed]);

  // Return null on mobile devices to hide the sidebar completely
  if (isMobile) {
    return null;
  }

  return (
    <motion.div
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 240,
        transition: { duration: 0.2, type: "spring", stiffness: 500, damping: 30 },
      }}
      className="fixed left-0 top-0 z-30 h-screen border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 shadow-[1px_0_5px_0_rgba(0,0,0,0.05)]"
    >
      <div className="flex h-full flex-col">
        {/* Header with team switcher */}
        <div className="border-b border-slate-200 p-2 dark:border-slate-800">
          <TeamSwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isCollapsed={isCollapsed}
                isActive={activeItem === item.path.split("/")[1] || 
                          (activeItem === "" && item.path === "/dashboard")}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* User profile section */}
        <div className="mt-auto border-t border-slate-200 p-2 dark:border-slate-800">
          <SidebarUserProfile isCollapsed={isCollapsed} />
        </div>
      </div>
    </motion.div>
  );
}
