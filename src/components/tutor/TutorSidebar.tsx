
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Brain, FileText, History, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function TutorSidebar() {
  const isMobile = useIsMobile();

  const menuItems = [
    {
      icon: Brain,
      label: "AI Tutor",
      path: "/tutor",
    },
    {
      icon: FileText,
      label: "Study Materials",
      path: "/media-library",
    },
    {
      icon: History,
      label: "Chat History",
      path: "#",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/profile-settings",
    },
  ];

  return (
    <Sidebar
      className={`
        ${isMobile ? 'w-[60px] hover:w-[200px] transition-all duration-300 ease-in-out' : 'w-[200px]'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      `}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-500" />
          {!isMobile && <span className="font-semibold">AI Tutor</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild>
                <Link 
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className={`
                    ${isMobile ? 'opacity-0 group-hover/sidebar-wrapper:opacity-100 transition-opacity duration-300' : ''}
                    text-gray-700 dark:text-gray-300
                  `}>
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
