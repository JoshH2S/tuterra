
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { ChevronUp } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import { MobileNavigation } from "./MobileNavigation";

interface Section {
  id: string;
  label: string;
}

interface EnhancedNavigationProps {
  sections: Section[];
}

export function EnhancedNavigation({ sections }: EnhancedNavigationProps) {
  const [activeSection, setActiveSection] = useState("");
  const { isDesktop } = useResponsive();
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToSection(sectionId);
    }
  };

  if (isDesktop) {
    return (
      <nav 
        className="fixed top-1/2 right-8 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3"
        aria-label="Page navigation"
      >
        {sections.map((section) => (
          <InteractiveTooltip
            key={section.id}
            content={<span className="font-medium">{section.label}</span>}
            trigger={
              <motion.a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section.id);
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors block focus:outline-none focus:ring-2 focus:ring-primary",
                  activeSection === section.id
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
                aria-label={`Navigate to ${section.label} section`}
                onKeyDown={(e) => handleKeyDown(e, section.id)}
                tabIndex={0}
              />
            }
          />
        ))}
        
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="mt-4 bg-white dark:bg-gray-800 w-8 h-8 rounded-full shadow-md flex items-center justify-center text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Back to top"
          tabIndex={0}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      </nav>
    );
  }

  return <MobileNavigation sections={sections} />;
}