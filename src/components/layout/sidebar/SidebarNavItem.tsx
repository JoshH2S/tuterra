
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  icon: ReactNode;
  title: string;
  href: string;
  isActive: boolean;
}

export const SidebarNavItem = ({ 
  icon, 
  title, 
  href, 
  isActive 
}: SidebarNavItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link 
          to={href} 
          className={`flex items-center ${isActive ? 'font-semibold' : ''}`}
        >
          <span className="mr-2 h-4 w-4">
            {icon}
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
            {title}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
