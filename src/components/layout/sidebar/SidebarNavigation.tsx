
import { useLocation } from "react-router-dom";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarNavItem } from "./SidebarNavItem";
import { Home, BookOpen, Trophy, Brain, FileText } from "lucide-react";

const SidebarNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SidebarMenu>
      <SidebarNavItem
        icon={<Home className="h-4 w-4" />}
        title="Dashboard"
        href="/"
        isActive={currentPath === "/"}
      />
      
      <SidebarNavItem
        icon={<BookOpen className="h-4 w-4" />}
        title="Courses"
        href="/courses"
        isActive={currentPath.startsWith("/courses")}
      />
      
      <SidebarNavItem
        icon={<FileText className="h-4 w-4" />}
        title="Quizzes"
        href="/quizzes"
        isActive={currentPath.startsWith("/quizzes")}
      />
      
      <SidebarNavItem
        icon={<Brain className="h-4 w-4" />}
        title="Skills"
        href="/skill-assessments"
        isActive={currentPath.startsWith("/skill-assessments")}
      />
      
      <SidebarNavItem
        icon={<Trophy className="h-4 w-4" />}
        title="Interview"
        href="/interview"
        isActive={currentPath.startsWith("/interview")}
      />
    </SidebarMenu>
  );
};

export default SidebarNavigation;
