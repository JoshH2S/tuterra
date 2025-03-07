
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

export const SidebarNavigation = () => {
  return (
    <SidebarMenu>
      <SidebarNavItem to="/dashboard" icon={LayoutDashboard}>
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem to="/courses" icon={BookOpen}>
        Courses
      </SidebarNavItem>
      <SidebarNavItem to="/lesson-planning" icon={ClipboardList}>
        Lesson Planning
      </SidebarNavItem>
      <SidebarNavItem to="/quiz-generation" icon={FileText}>
        Quiz Generation
      </SidebarNavItem>
      <SidebarNavItem to="/skill-assessments" icon={Award}>
        Skill Assessments
      </SidebarNavItem>
      <SidebarNavItem to="/job-interview-simulator" icon={CalendarClock}>
        Interview Simulator
      </SidebarNavItem>
      <SidebarNavItem to="/tutor" icon={Brain}>
        AI Tutor
      </SidebarNavItem>
    </SidebarMenu>
  );
};
