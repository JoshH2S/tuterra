
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MobileUserProfileProps {
  onClose?: () => void;
}

export function MobileUserProfile({ onClose }: MobileUserProfileProps) {
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
    if (onClose) onClose();
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

  const handleProfileClick = () => {
    if (onClose) onClose();
    navigate("/profile-settings");
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        className="p-0 h-auto flex items-center gap-3 flex-1 touch-manipulation"
        onClick={handleProfileClick}
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
