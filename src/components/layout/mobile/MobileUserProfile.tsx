import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface MobileUserProfileProps {
  onClose?: () => void;
}

export function MobileUserProfile({ onClose }: MobileUserProfileProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        fetchUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setFirstName("");
        setLastName("");
        setAvatarUrl("");
        setUserId(null);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setAvatarUrl(session.user.user_metadata?.avatar_url || "");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('mobile-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload: { new: { avatar_url: string | null, first_name: string, last_name: string } }) => {
          if (payload.new.avatar_url) {
            setAvatarUrl(payload.new.avatar_url);
          }
          setFirstName(payload.new.first_name || "");
          setLastName(payload.new.last_name || "");
        }
      )
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const handleLogout = async () => {
    if (onClose) onClose();
    try {
      await supabase.auth.signOut();
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
          <p className="text-xs text-muted-foreground">Manage your account</p>
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
