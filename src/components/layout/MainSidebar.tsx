
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarUserProfile } from "./sidebar/SidebarUserProfile";

export const MainSidebar = () => {
  return (
    <Sidebar className="w-[190px] border-r border-border">
      <SidebarHeader>
        <Link to="/" className="flex items-center p-4">
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">EduPortal</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
        <SidebarNavigation />
        <SidebarUserProfile />
      </SidebarContent>
    </Sidebar>
  );
};
