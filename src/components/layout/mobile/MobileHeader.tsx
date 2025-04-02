
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Search, CreditCard } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MobileSearch } from "./MobileSearch";
import { MobileMenu } from "./MobileMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";

export function MobileHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  
  // Close the menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileMenu onClose={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="font-semibold text-lg">EduPortal</div>
          
          <div className="flex items-center space-x-2">
            {subscription?.tier === 'free' && (
              <Button
                variant="default"
                size="sm"
                className="text-xs h-8 px-3"
                onClick={handleUpgradeClick}
              >
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                Upgrade
              </Button>
            )}
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 touch-manipulation"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </motion.button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
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
