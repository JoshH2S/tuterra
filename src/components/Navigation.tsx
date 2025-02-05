import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  const links = [
    { href: "/courses", label: "Courses" },
    { href: "/lesson-planning", label: "Lesson Planning" },
    { href: "/tutor", label: "AI Tutor" },  // Changed from /course/tutor to /tutor
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