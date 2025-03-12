
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronUp, Home, Bell, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { QuickActionButtons } from "./QuickActionButtons";
import { Link, useLocation } from "react-router-dom";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showToTop, setShowToTop] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Check scroll position to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile-settings" },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t z-50 lg:hidden safe-area-bottom"
      >
        <nav className="flex items-center justify-around p-4">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className="touch-manipulation no-context-menu"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center touch-feedback ${
                  location.pathname === item.path 
                    ? "text-primary-500" 
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </motion.div>
            </Link>
          ))}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="touch-manipulation h-14 w-14 rounded-full flex items-center justify-center bg-white/20 shadow-sm border border-gray-200/30 active:scale-95 transition-transform"
              >
                <Menu className="h-6 w-6 text-primary" />
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
                className="touch-manipulation h-14 w-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg flex items-center justify-center border border-gray-200/30 active:scale-95 transition-transform"
              >
                <ChevronUp className="h-6 w-6 text-primary" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
