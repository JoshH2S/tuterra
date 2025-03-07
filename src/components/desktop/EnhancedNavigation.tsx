
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { ChevronUp } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";

// Section data - these should match your page's actual sections
const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "testimonials", label: "Testimonials" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" }
];

/**
 * SectionDots component for navigation
 * - Shows interactive dots for each section
 * - Highlights active section
 * - Uses tooltips for labels
 */
export function SectionDots() {
  const [activeSection, setActiveSection] = useState("");
  const { isDesktop } = useResponsive();

  useEffect(() => {
    if (!isDesktop) return;

    // Intersection Observer for active section detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all sections
    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isDesktop]);

  // Back to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isDesktop) return null;

  return (
    <nav className="fixed top-1/2 right-8 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
      {sections.map((section) => (
        <InteractiveTooltip
          key={section.id}
          content={<span className="font-medium">{section.label}</span>}
          trigger={
            <motion.a
              href={`#${section.id}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-3 h-3 rounded-full transition-colors block",
                activeSection === section.id
                  ? "bg-primary"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              aria-label={`Navigate to ${section.label} section`}
            />
          }
        />
      ))}
      
      {/* Back to top button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="mt-4 bg-white dark:bg-gray-800 w-8 h-8 rounded-full shadow-md flex items-center justify-center text-primary"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </nav>
  );
}

/**
 * Desktop Navigation with section tracking
 * - Only renders on desktop screens
 * - Provides enhanced navigation experience
 */
export function DesktopNavigation() {
  const { isDesktop } = useResponsive();

  if (!isDesktop) return null;

  return (
    <div className="hidden lg:block">
      <SectionDots />
    </div>
  );
}

export default DesktopNavigation;
