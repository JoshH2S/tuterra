
import { 
  BookOpen, 
  ClipboardList, 
  Brain, 
  FileText, 
  LayoutDashboard, 
  Award,
  CalendarClock
} from "lucide-react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarNavItem } from "./SidebarNavItem";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const navigationItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/courses", icon: BookOpen, label: "Courses" },
  { path: "/lesson-planning", icon: ClipboardList, label: "Lesson Planning" },
  { path: "/quiz-generation", icon: FileText, label: "Quiz Generation" },
  { path: "/skill-assessments", icon: Award, label: "Skill Assessments" },
  { path: "/job-interview-simulator", icon: CalendarClock, label: "Interview Simulator" },
  { path: "/tutor", icon: Brain, label: "AI Tutor" },
];

interface SidebarNavigationProps {
  isCollapsed?: boolean;
}

export const SidebarNavigation = ({ isCollapsed }: SidebarNavigationProps) => {
  const location = useLocation();
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-2"
    >
      <SidebarMenu>
        <AnimatePresence mode="wait">
          {navigationItems.map((item) => (
            <SidebarNavItem 
              key={item.path} 
              to={item.path} 
              icon={item.icon} 
              isActive={location.pathname === item.path}
              isCollapsed={isCollapsed}
            >
              {item.label}
            </SidebarNavItem>
          ))}
        </AnimatePresence>
      </SidebarMenu>
    </motion.div>
  );
};
