
import { Home, BookOpen, PenTool, BarChart2, User } from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarMenu } from "@/components/ui/sidebar";

export const SidebarNavigation = () => {
  return (
    <SidebarMenu>
      <SidebarNavItem to="/dashboard" icon={Home}>
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem to="/courses" icon={BookOpen}>
        Courses
      </SidebarNavItem>
      <SidebarNavItem to="/quizzes" icon={PenTool}>
        Quizzes
      </SidebarNavItem>
      <SidebarNavItem to="/job-interview-simulator" icon={User}>
        Interview Prep
      </SidebarNavItem>
      <SidebarNavItem to="/skill-assessments" icon={BarChart2}>
        Skill Assessment
      </SidebarNavItem>
    </SidebarMenu>
  );
};
