
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUp, Brain, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { navigationItems } from "../sidebar/SidebarNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 lg:hidden"
      >
        <nav className="flex items-center justify-around p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="touch-manipulation h-12 w-12 rounded-full"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[80%] sm:w-[350px] border-r">
              <MobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </nav>
      </motion.div>

      {/* Quick Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50 lg:hidden">
        <QuickActionButtons />
      </div>
    </>
  );
}

// Mobile Menu Component
function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center" onClick={onClose}>
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">EduPortal</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="touch-manipulation h-10 w-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <MobileNavItems onClose={onClose} />
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <MobileUserProfile />
      </div>
    </div>
  );
}

// Mobile Navigation Items
function MobileNavItems({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  
  return (
    <div className="space-y-1 px-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-4 rounded-lg transition-colors touch-manipulation",
              "hover:bg-accent",
              isActive ? "bg-blue-50 dark:bg-blue-950/30" : ""
            )}
          >
            <Icon className={cn(
              "h-5 w-5",
              isActive 
                ? "text-blue-500" 
                : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
            )} />
            <span className={cn(
              "font-medium",
              isActive 
                ? "text-blue-700 dark:text-blue-400" 
                : "text-gray-800 dark:text-gray-200"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

// Quick Action Buttons
function QuickActionButtons() {
  return (
    <motion.div layout className="space-y-2">
      <Button
        size="icon"
        variant="default"
        className="rounded-full shadow-lg h-12 w-12 touch-manipulation"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Scroll to top</span>
      </Button>
      <Button
        size="icon"
        variant="default"
        className="rounded-full shadow-lg h-12 w-12 touch-manipulation"
        asChild
      >
        <Link to="/tutor">
          <Brain className="h-5 w-5" />
          <span className="sr-only">AI Tutor</span>
        </Link>
      </Button>
    </motion.div>
  );
}

// Mobile User Profile
function MobileUserProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        fetchUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setFirstName("");
        setLastName("");
        setAvatarUrl("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate("/auth");
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    }
    return "U";
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        className="p-0 h-auto flex items-center gap-3 flex-1 touch-manipulation"
        onClick={() => navigate("/profile-settings")}
      >
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={avatarUrl} 
            alt="Profile" 
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="font-medium">{firstName && lastName ? `${firstName} ${lastName}` : "User"}</p>
        </div>
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        className="touch-manipulation h-10 w-10"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
}
