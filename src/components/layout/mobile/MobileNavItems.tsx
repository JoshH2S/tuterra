
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "../sidebar/SidebarNavigation";
import { cn } from "@/lib/utils";

interface MobileNavItemsProps {
  onClose: () => void;
}

export function MobileNavItems({ onClose }: MobileNavItemsProps) {
  const location = useLocation();
  
  return (
    <div className="space-y-1 px-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-4 rounded-lg transition-colors touch-manipulation",
              "hover:bg-accent",
              isActive ? "bg-blue-50 dark:bg-blue-950/30" : ""
            )}
          >
            <Icon className={cn(
              "h-5 w-5",
              isActive 
                ? "text-blue-500" 
                : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
            )} />
            <span className={cn(
              "font-medium",
              isActive 
                ? "text-blue-700 dark:text-blue-400" 
                : "text-gray-800 dark:text-gray-200"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
