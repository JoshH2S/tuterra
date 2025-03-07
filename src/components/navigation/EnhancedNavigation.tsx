
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeable } from "react-swipeable";

interface Section {
  id: string;
  title: string;
}

interface EnhancedNavigationProps {
  sections: Section[];
}

export function EnhancedNavigation({ sections }: EnhancedNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const isMobile = useIsMobile();
  
  // Handle swipe navigation for mobile
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      const currentIndex = sections.findIndex(section => section.id === activeSection);
      if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        document.getElementById(nextSection.id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(nextSection.id);
      }
    },
    onSwipedDown: () => {
      const currentIndex = sections.findIndex(section => section.id === activeSection);
      if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        document.getElementById(prevSection.id)?.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(prevSection.id);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  useEffect(() => {
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
    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Different UI for mobile vs desktop
  if (isMobile) {
    return (
      <div {...swipeHandlers} className="fixed bottom-4 left-0 right-0 z-40 flex justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex gap-2">
          {sections.map((section) => (
            <motion.a
              key={section.id}
              href={`#${section.id}`}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-2.5 h-2.5 rounded-full touch-manipulation",
                activeSection === section.id
                  ? "bg-brand-accent"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              aria-label={`Navigate to ${section.title}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed top-1/2 right-8 -translate-y-1/2 z-40 hidden lg:block">
      <motion.div className="flex flex-col gap-4 p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full shadow-lg">
        {sections.map((section) => (
          <motion.a
            key={section.id}
            href={`#${section.id}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              activeSection === section.id
                ? "bg-brand-accent"
                : "bg-gray-300 dark:bg-gray-600"
            )}
            aria-label={`Navigate to ${section.title}`}
          />
        ))}
      </motion.div>
    </nav>
  );
}
