
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick: () => void;
}

export const SidebarNavItem = ({ 
  icon: Icon, 
  label, 
  isActive = false,
  isCollapsed = false,
  onClick
}: SidebarNavItemProps) => {
  const itemContent = (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center relative w-full py-2 px-3 rounded-lg transition-all duration-200",
        isActive && "bg-blue-50 dark:bg-blue-950/30"
      )}
    >
      <div className={cn(
        "flex items-center gap-2 relative z-10",
        isCollapsed && "justify-center"
      )}>
        {/* Icon */}
        <Icon className={cn(
          "h-5 w-5",
          isActive 
            ? "text-blue-500" 
            : "text-gray-500 group-hover:text-gray-900"
        )} />
        
        {/* Label */}
        {(!isCollapsed || (isCollapsed && isActive)) && (
          <span className={cn(
            "font-medium",
            isActive 
              ? "text-blue-500"
              : "text-gray-700 group-hover:text-gray-900",
            isCollapsed && isActive && "absolute left-16 bg-white shadow-sm px-2 py-1 rounded-md"
          )}>
            {label}
          </span>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gray-100/0 hover:bg-gray-100/50 transition-colors" />
    </button>
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        {isCollapsed && !isActive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {itemContent}
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        ) : (
          itemContent
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
