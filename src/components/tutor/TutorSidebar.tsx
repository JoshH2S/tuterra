
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
        ${isMobile ? 'fixed left-0 top-0 h-full -translate-x-full data-[opened=true]:translate-x-0 transition-transform duration-300' : 'w-[200px]'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40
      `}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span className="font-semibold">AI Tutor</span>
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
                  <span className="text-gray-700 dark:text-gray-300">
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
