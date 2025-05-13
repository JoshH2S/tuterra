
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { navigationItems } from "../sidebar/SidebarNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const MobileNavigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  // Define the primary navigation items (shown in the bottom bar)
  const primaryNavItems = navigationItems.slice(0, 4);
  
  // Check if a path is active, similar to the desktop sidebar
  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path === '/dashboard' && location.pathname === '/') return true;
    if (path !== '/' && path !== '/dashboard' && location.pathname.startsWith(path)) {
      const morePreciseMatch = navigationItems.some(item => 
        item.path !== path && 
        item.path.startsWith(path) && 
        location.pathname.startsWith(item.path)
      );
      return !morePreciseMatch;
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-md">
      <div className="grid grid-cols-5 h-16">
        {primaryNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1",
              isActive(item.path) 
                ? "text-primary" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            {isActive(item.path) ? (
              <motion.div
                layoutId="mobileNavIndicator"
                className="absolute bottom-0 h-1 w-10 rounded-t-md bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            ) : null}
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1 truncate w-full text-center">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
        
        {/* More menu button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}>
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-safe">
            <div className="grid grid-cols-3 gap-4 py-4">
              {navigationItems.slice(4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg",
                    isActive(item.path)
                      ? "bg-primary-100 text-primary"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">{item.label}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
