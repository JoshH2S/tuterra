
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookOpen, ClipboardList, Brain, FileText } from "lucide-react";

export const Navigation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  const links = [
    { 
      href: "/courses", 
      label: "Courses",
      icon: BookOpen
    },
    { 
      href: "/lesson-planning", 
      label: "Lesson Planning",
      icon: ClipboardList
    },
    { 
      href: "/quiz-generation", 
      label: "Quiz Generation",
      icon: FileText
    },
    { 
      href: "/tutor", 
      label: "AI Tutor",
      icon: Brain
    },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-primary-200 sticky top-0 z-50">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 max-w-7xl mx-auto p-4`}>
        <Link 
          to="/"
          className="text-2xl font-bold text-primary-700 hover:text-primary-800 transition-colors"
        >
          EduAI
        </Link>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
          {links.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-all duration-200
                ${location.pathname === link.href 
                  ? 'bg-primary-100 text-primary-700 font-semibold' 
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
