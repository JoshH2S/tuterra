import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookOpen, ClipboardList, Brain } from "lucide-react";

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
      href: "/tutor", 
      label: "AI Tutor",
      icon: Brain
    },
  ];

  return (
    <nav className="bg-white/50 backdrop-blur-sm p-4 shadow-sm">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 max-w-7xl mx-auto`}>
        {links.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              hover:bg-primary-100 hover:text-primary
              ${location.pathname === link.href 
                ? 'bg-primary-100 text-primary font-semibold' 
                : 'text-gray-600'
              }
            `}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};