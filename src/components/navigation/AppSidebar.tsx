
import { Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Study Groups",
      url: "/study-groups",
      icon: Users,
    },
    // ... Add other menu items as needed
  ];

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                active={location.pathname === item.url}
                onClick={() => navigate(item.url)}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
