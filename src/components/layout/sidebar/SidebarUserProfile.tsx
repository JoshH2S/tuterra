
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  // Animation variants
  const profileVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

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

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          const newData = payload.new as { first_name: string; last_name: string; avatar_url: string };
          setFirstName(newData.first_name || "");
          setLastName(newData.last_name || "");
          setAvatarUrl(newData.avatar_url || "");
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      profileChannel.unsubscribe();
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

  const profileContent = (
    <Link to="/profile-settings" className={cn(
      "flex items-center gap-2 group p-2 rounded-xl transition-all duration-200",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      isCollapsed ? "justify-center" : "justify-start"
    )}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Avatar className="h-8 w-8 border-2 border-white/10 dark:border-black/10 shadow-sm">
          <AvatarImage 
            src={avatarUrl} 
            alt="Profile" 
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      
      {!isCollapsed && (
        <span className="text-left break-words leading-tight min-w-0 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500 text-sm">
          {firstName && lastName ? `${firstName} ${lastName}` : "Profile Settings"}
        </span>
      )}
    </Link>
  );

  const logoutContent = (
    <button 
      onClick={handleLogout}
      className={cn(
        "flex items-center group p-2 rounded-xl transition-all duration-200 w-full",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <LogOut className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300" />
      </motion.div>
      
      {!isCollapsed && (
        <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-400 dark:to-gray-500 group-hover:from-gray-800 group-hover:to-gray-700 dark:group-hover:from-gray-300 dark:group-hover:to-gray-400 text-sm">
          Log Out
        </span>
      )}
    </button>
  );

  return (
    <motion.div 
      variants={profileVariants}
      initial="hidden"
      animate="visible"
      className="mt-auto pt-4 border-t border-border/30"
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {profileContent}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {firstName && lastName ? `${firstName} ${lastName}` : "Profile Settings"}
                </TooltipContent>
              </Tooltip>
            ) : (
              profileContent
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  {logoutContent}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Log Out
                </TooltipContent>
              </Tooltip>
            ) : (
              logoutContent
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </motion.div>
  );
};
