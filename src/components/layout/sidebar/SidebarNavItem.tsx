
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  children: ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const SidebarNavItem = ({ 
  to, 
  icon: Icon, 
  children, 
  isActive = false,
  isCollapsed = false
}: SidebarNavItemProps) => {
  // Animation variants for each menu item
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };
  
  const itemContent = (
    <Link 
      to={to} 
      className={cn(
        "flex items-center group relative w-full py-2.5 px-3 rounded-xl transition-all duration-200",
        "touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive && "text-primary font-medium"
      )}
    >
      <motion.div
        className={cn(
          "relative z-10 flex items-center",
          isCollapsed ? "justify-center w-full" : "mr-2"
        )}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className={cn(
          "h-5 w-5 transition-colors",
          isActive 
            ? "text-blue-500" 
            : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
        )} />
      </motion.div>
      
      {/* Always show text for active items, even when sidebar is collapsed */}
      {(!isCollapsed || (isCollapsed && isActive)) && (
        <span className={cn(
          "text-transparent bg-clip-text transition-colors z-10",
          isActive
            ? "bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500"
            : "bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-400 dark:to-gray-500 group-hover:from-gray-800 group-hover:to-gray-700 dark:group-hover:from-gray-300 dark:group-hover:to-gray-400",
          isCollapsed && isActive && "absolute left-16 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md whitespace-nowrap"
        )}>
          {children}
        </span>
      )}
      
      {isActive && (
        <motion.div 
          layoutId="activeBackground"
          className="absolute inset-0 bg-blue-50 dark:bg-blue-950/30 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );

  return (
    <SidebarMenuItem>
      <motion.div variants={itemVariants}>
        <SidebarMenuButton asChild>
          {isCollapsed && !isActive ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {itemContent}
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {children}
              </TooltipContent>
            </Tooltip>
          ) : (
            itemContent
          )}
        </SidebarMenuButton>
      </motion.div>
    </SidebarMenuItem>
  );
};
