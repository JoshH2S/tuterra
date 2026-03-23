
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
  path?: string;
  id?: string;
}

export const SidebarNavItem = ({ 
  icon: Icon, 
  label, 
  isActive = false,
  isCollapsed = false,
  onClick,
  path,
  id
}: SidebarNavItemProps) => {
  // Animation variants for each menu item
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };
  
  const itemContent = (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        "flex items-center relative w-full py-2.5 px-3 rounded-lg transition-all duration-200 touch-manipulation group/navitem",
        id === "sidebar-courses" && "course-highlight"
      )}
    >
      <motion.div
        className="relative z-10 flex items-center mr-2.5"
        whileTap={{ scale: 0.95 }}
      >
        <Icon className={cn(
          "h-[18px] w-[18px] transition-colors",
          isActive
            ? "text-[#C8A84B]"
            : "text-white/40 group-hover/navitem:text-white/70"
        )} />
      </motion.div>

      <span className={cn(
        "text-sm transition-colors z-10",
        isActive
          ? "text-white font-medium"
          : "text-white/50 group-hover/navitem:text-white/80"
      )}>
        {label}
      </span>

      {/* Active: left accent bar + subtle background */}
      {isActive && (
        <>
          <motion.div
            layoutId="activeBackground"
            className="absolute inset-0 bg-white/8 rounded-lg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C8A84B] rounded-r-full" />
        </>
      )}

      {/* Hover background */}
      {!isActive && (
        <div className="absolute inset-0 rounded-lg bg-white/0 group-hover/navitem:bg-white/5 transition-colors duration-200" />
      )}
    </button>
  );

  return (
    <SidebarMenuItem>
      <motion.div variants={itemVariants}>
        <SidebarMenuButton asChild>
          {itemContent}
        </SidebarMenuButton>
      </motion.div>
      
      {/* Add course highlight CSS to index.html */}
    </SidebarMenuItem>
  );
};
