
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
        "w-full flex items-center gap-3 px-3 h-[34px] rounded-md text-sm transition-all duration-200",
        "group/item relative",
        isActive 
          ? "bg-gray-100 dark:bg-gray-800" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
    >
      <div className="min-w-[24px] flex items-center justify-center">
        <Icon 
          className={cn(
            "h-4 w-4",
            isActive 
              ? "text-gray-900 dark:text-gray-100" 
              : "text-gray-600 dark:text-gray-400"
          )} 
        />
      </div>
      
      {(!isCollapsed || (isCollapsed && isActive)) && (
        <span 
          className={cn(
            "truncate",
            isActive 
              ? "text-gray-900 dark:text-gray-100" 
              : "text-gray-700 dark:text-gray-300",
            isCollapsed && "opacity-0 group-hover/sidebar:opacity-100 transition-opacity",
            isCollapsed && isActive && "absolute left-12 bg-white dark:bg-gray-900 shadow-sm px-2 py-1 rounded-md z-50"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );

  return (
    <SidebarMenuItem className="my-1 px-2">
      <SidebarMenuButton asChild>
        {isCollapsed && !isActive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {itemContent}
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              sideOffset={10}
              className="bg-white dark:bg-gray-900 text-sm font-medium"
            >
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
