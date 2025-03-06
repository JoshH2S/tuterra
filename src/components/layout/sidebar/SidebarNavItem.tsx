
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  children: ReactNode;
}

export const SidebarNavItem = ({ to, icon: Icon, children }: SidebarNavItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to={to} className="flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
            {children}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
