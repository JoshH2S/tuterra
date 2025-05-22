import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuickActionButtons } from "./QuickActionButtons";
import { useLocation } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export function MobileNavigation() {
  const [showToTop, setShowToTop] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { isLoggedIn } = useAuthStatus();

  // Don't show on desktop or on the landing page
  const isLandingPage = location.pathname === "/";
  if (!isMobile || isLandingPage) {
    console.debug("[MobileNavigation] Early return: not mobile or landing page", { isMobile, pathname: location.pathname });
    return null;
  }

  // Show/hide back to top button on scroll
  useEffect(() => {
    const handleScroll = () => setShowToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change for mobile
  useEffect(() => {
    if (isMobile) window.scrollTo(0, 0);
  }, [location.pathname, isMobile]);

  return (
    <>
      {/* Quick Action Buttons */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-8 right-4 flex flex-col gap-2 z-50 lg:hidden"
        >
          <QuickActionButtons />

          {/* Back to top button */}
          <AnimatePresence>
            {showToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="touch-manipulation h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg flex items-center justify-center border border-gray-200/30 active:scale-95 transition-transform"
              >
                <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </>
  );
}