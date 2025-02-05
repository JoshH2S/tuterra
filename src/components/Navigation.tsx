import { Link, useLocation } from "react-router-dom";
import { useMobile } from "@/hooks/useMobile";

export const Navigation = () => {
  const isMobile = useMobile();
  const location = useLocation();

  const links = [
    { href: "/courses", label: "Courses" },
    { href: "/lesson-planning", label: "Lesson Planning" },
    { href: "/tutor", label: "AI Tutor" },
  ];

  return (
    <nav className={`flex ${isMobile ? 'flex-col' : 'flex-row'} space-x-4`}>
      {links.map(link => (
        <Link
          key={link.href}
          to={link.href}
          className={`text-gray-800 hover:text-primary ${location.pathname === link.href ? 'font-bold' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
