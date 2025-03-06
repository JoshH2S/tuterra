
import React from 'react';
import { useLocation } from 'react-router-dom';

import { SidebarNavItem } from './SidebarNavItem';
import {
  GraduationCap,
  BarChart3,
  User,
  FileQuestion,
  List,
  BookOpen,
  Laptop,
  FileText,
  BrainCircuit,
  PenTool,
  Briefcase
} from 'lucide-react';

const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="space-y-1">
      <SidebarNavItem
        icon={<BarChart3 />}
        title="Dashboard"
        href="/dashboard"
        isActive={pathname === '/dashboard'}
      />
      <SidebarNavItem
        icon={<User />}
        title="Profile"
        href="/profile"
        isActive={pathname === '/profile'}
      />
      <SidebarNavItem
        icon={<GraduationCap />}
        title="Courses"
        href="/courses"
        isActive={pathname === '/courses' || pathname.startsWith('/courses/')}
      />
      <SidebarNavItem
        icon={<List />}
        title="Course Templates"
        href="/course-templates"
        isActive={pathname === '/course-templates'}
      />
      <SidebarNavItem
        icon={<FileText />}
        title="Lesson Planning"
        href="/lesson-planning"
        isActive={pathname === '/lesson-planning'}
      />
      <SidebarNavItem
        icon={<FileQuestion />}
        title="Quiz Generator"
        href="/quiz-generation"
        isActive={pathname === '/quiz-generation'}
      />
      <SidebarNavItem
        icon={<BookOpen />}
        title="Quizzes"
        href="/quizzes"
        isActive={pathname === '/quizzes' || pathname.startsWith('/quizzes/')}
      />
      <SidebarNavItem
        icon={<Laptop />}
        title="Case Study Quiz"
        href="/case-study-quiz"
        isActive={pathname === '/case-study-quiz'}
      />
      <SidebarNavItem
        icon={<BrainCircuit />}
        title="Skill Assessments"
        href="/skill-assessments"
        isActive={pathname === '/skill-assessments' || pathname.startsWith('/skill-assessments/')}
      />
      <SidebarNavItem
        icon={<Briefcase />}
        title="Interview Simulator"
        href="/interview-simulator"
        isActive={pathname === '/interview-simulator'}
      />
    </div>
  );
};

export default SidebarNavigation;
