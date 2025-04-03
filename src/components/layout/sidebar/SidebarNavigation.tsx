
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

  // Admin or teacher-only items
  if (user?.user_metadata?.user_type === "teacher") {
    // Add teacher-specific items if needed
  }
  
  return (
    <nav className="flex-1 py-2">
      <ul className="space-y-1 px-2 list-none">
        {navigationItems.map((item) => (
          <li key={item.path}>
            <SidebarNavItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={activeItem === item.path.split("/")[1] || 
                       (activeItem === "" && item.path === "/dashboard")}
              onClick={() => handleNavigation(item.path)}
              isCollapsed={isCollapsed}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};
