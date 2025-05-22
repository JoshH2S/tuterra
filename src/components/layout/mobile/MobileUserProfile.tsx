import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface MobileUserProfileProps {
  onClose?: () => void;
}

export function MobileUserProfile({ onClose }: MobileUserProfileProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  const { user, authReady, signOut } = useAuth();

  useEffect(() => {
    if (!authReady || !user) return;
    const fetchUserProfile = async () => {
      try {
        setAvatarUrl(user.user_metadata?.avatar_url || "");
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          if (!user.user_metadata?.avatar_url) {
            setAvatarUrl(data.avatar_url || "");
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchUserProfile();
  }, [authReady, user]);

  if (!authReady) return <div className="h-16 flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  const handleLogout = async () => {
    if (onClose) onClose();
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate("/");
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <div className="flex items-center p-4">
      <Avatar onClick={handleProfileClick} className="cursor-pointer">
        {avatarUrl ? <AvatarImage src={avatarUrl} /> : <AvatarFallback>{getInitials()}</AvatarFallback>}
      </Avatar>
      <div className="ml-3">
        <div className="font-semibold">{firstName || user.email}</div>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="ml-auto">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
