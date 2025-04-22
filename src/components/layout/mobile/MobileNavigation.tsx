
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronUp, Home, Bell, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { QuickActionButtons } from "./QuickActionButtons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export function MobileNavigation() {
  // Move ALL hooks to the top level
  const [isOpen, setIsOpen] = useState(false);
  const [showToTop, setShowToTop] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, checkingAuth } = useAuthStatus();
  
  // Compute synchronous values for conditionals
  const isLandingPage = location.pathname === "/";
  
  // Early return for non-mobile screens or landing page
  if (!isMobile || isLandingPage) return null;

  // Check scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change for mobile
  useEffect(() => {
    if (isMobile) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile-settings" },
  ];

  const handleNavItemClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-primary-100/80 to-primary-200/80 backdrop-blur-lg border-t z-50 lg:hidden safe-area-bottom w-full"
      >
        <nav className="flex items-center justify-around p-2 w-full">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className="touch-manipulation no-context-menu"
              onClick={() => {
                setIsOpen(false);
                handleNavItemClick();
              }}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center touch-feedback ${
                  location.pathname === item.path 
                    ? "text-primary-500" 
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </motion.div>
            </Link>
          ))}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="touch-manipulation h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center bg-white/20 shadow-sm border border-gray-200/30 active:scale-95 transition-transform"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-[85%] sm:w-[350px] border-r shadow-xl swipe-container"
              hideCloseButton
            >
              <MobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </nav>
      </motion.div>

      {/* Quick Action Buttons */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 right-4 flex flex-col gap-2 z-50 lg:hidden"
        >
          <QuickActionButtons />
          
          {/* Back to top button with improved mobile touch */}
          <AnimatePresence>
            {showToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
