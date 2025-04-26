import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Zap, TrendingUp, DollarSign, Rocket } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

interface MobileNavigationProps {
  sections: Section[];
}

export function MobileNavigation({ sections }: MobileNavigationProps) {
  const [activeSection, setActiveSection] = useState("");
  const headerHeight = 80;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: `-${headerHeight}px 0px 0px 0px`
      }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [headerHeight]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToSection(sectionId);
    }
  };

  const getIcon = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return <Home className="h-5 w-5" />;
      case "features":
        return <Zap className="h-5 w-5" />;
      case "comparison":
        return <TrendingUp className="h-5 w-5" />;
      case "pricing":
        return <DollarSign className="h-5 w-5" />;
      case "cta":
        return <Rocket className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-center h-16">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-2 text-sm font-medium transition-colors",
              activeSection === section.id
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400"
            )}
            aria-label={`Navigate to ${section.label} section`}
            onKeyDown={(e) => handleKeyDown(e, section.id)}
            tabIndex={0}
          >
            {getIcon(section.id)}
            <span className="text-xs mt-1">{section.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}
