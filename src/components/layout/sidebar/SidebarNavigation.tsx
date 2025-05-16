import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SidebarNavItem } from "./SidebarNavItem";
import { 
  BookOpenText, 
  GraduationCap, 
  Home, 
  BrainCircuit, 
  UserRoundCog,
  MessageCircleQuestion,
  ScrollText,
  Users,
  FileQuestion,
  Briefcase,
  LucideIcon
} from "lucide-react";

interface SidebarNavigationProps {
  isCollapsed?: boolean;
}

// Define the navigation item interface
interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

// Export navigation items for reuse in mobile navigation
export const navigationItems: NavigationItem[] = [
  { 
    icon: Home, 
    label: "Dashboard", 
    path: "/dashboard" 
  },
  { 
    icon: BookOpenText, 
    label: "Courses", 
    path: "/courses" 
  },
  { 
    icon: ScrollText, 
    label: "Quizzes", 
    path: "/quizzes" 
  },
  { 
    icon: FileQuestion, 
    label: "Skill Assessments", 
    path: "/assessments" 
  },
  { 
    icon: BrainCircuit, 
    label: "Interview Simulator", 
    path: "/interview-simulator" 
  },
  { 
    icon: UserRoundCog, 
    label: "Settings", 
    path: "/profile-settings" 
  }
];

export const SidebarNavigation = ({ isCollapsed = false }: SidebarNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path === '/dashboard' && location.pathname === '/') return true;
    if (path !== '/' && path !== '/dashboard' && location.pathname.startsWith(path)) {
      const morePreciseMatch = navigationItems.some(item => 
        item.path !== path && 
        item.path.startsWith(path) && 
        location.pathname.startsWith(item.path)
      );
      return !morePreciseMatch;
    }
    return false;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="flex-1 py-2">
      <ul className="space-y-1 px-2 list-none">
        {navigationItems.map((item) => (
          <li key={item.path}>
            <SidebarNavItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              isCollapsed={isCollapsed}
              path={item.path}
              id={item.path === "/courses" ? "sidebar-courses" : undefined}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};
