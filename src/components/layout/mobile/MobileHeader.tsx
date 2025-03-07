
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { MobileSearch } from "./MobileSearch";
import { Link } from "react-router-dom";

interface NotificationButtonProps {
  count: number;
}

function NotificationButton({ count }: NotificationButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0 touch-manipulation relative"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
      <span className="sr-only">Notifications</span>
    </motion.button>
  );
}

export function MobileHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="flex h-14 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="mr-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-manipulation h-10 w-10"
              size="icon"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-[85%] sm:w-[350px] border-r shadow-xl"
            hideCloseButton
          >
            <MobileMenu onClose={() => {}} />
          </SheetContent>
        </Sheet>
        
        <Link to="/dashboard" className="flex items-center flex-1 justify-center">
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
            EduPortal
          </span>
        </Link>

        <div className="flex items-center justify-end space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0 touch-manipulation"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </motion.button>

          <NotificationButton count={notifications.length} />
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <MobileSearch onClose={() => setIsSearchOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
