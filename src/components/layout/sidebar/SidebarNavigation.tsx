
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
  CreditCard,
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

// Group navigation items by sections
interface NavigationSection {
  title: string;
  items: NavigationItem[];
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
    label: "Assessments", 
    path: "/assessments" 
  },
  { 
    icon: MessageCircleQuestion, 
    label: "AI Tutor", 
    path: "/courses/tutor" 
  },
  { 
    icon: BrainCircuit, 
    label: "Interview Simulator", 
    path: "/interview-simulator" 
  },
  { 
    icon: CreditCard, 
    label: "Pricing", 
    path: "/pricing"
  },
  { 
    icon: UserRoundCog, 
    label: "Settings", 
    path: "/profile-settings" 
  }
];

// Organize navigation items into sections
const navigationSections: NavigationSection[] = [
  {
    title: "Main",
    items: navigationItems.slice(0, 4)
  },
  {
    title: "Learning Tools",
    items: navigationItems.slice(4, 6)
  },
  {
    title: "Account",
    items: navigationItems.slice(6)
  }
];

export const SidebarNavigation = ({ isCollapsed = false }: SidebarNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [activeItem, setActiveItem] = useState<string>("");

  useEffect(() => {
    const pathSegment = location.pathname.split("/")[1] || "dashboard";
    setActiveItem(pathSegment);
  }, [location]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="flex-1 py-2">
      <div className="space-y-5">
        {navigationSections.map((section) => (
          <div key={section.title} className="px-2">
            {!isCollapsed && (
              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 mb-2">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => (
              <SidebarNavItem 
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={activeItem === item.path.split("/")[1] || 
                         (activeItem === "" && item.path === "/dashboard")}
                onClick={() => handleNavigation(item.path)}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
};
