
import { useEffect, useState } from "react";
import { User, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'User';
  
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!user) return;

    setAvatarUrl(user.user_metadata?.avatar_url || null);

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload: { new: { avatar_url: string | null } }) => {
          setAvatarUrl(payload.new.avatar_url);
        }
      )
      .subscribe();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'USER_UPDATED') {
          setAvatarUrl(session?.user?.user_metadata?.avatar_url || null);
        }
      }
    );

    return () => {
      channel.unsubscribe();
      authSubscription.unsubscribe();
    };
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate("/"); // Redirect to landing page
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    navigate("/profile-settings");
  };

  return (
    <div className="flex flex-col w-full">
      {/* MAKE THE PROFILE AREA CLICKABLE */}
      <div 
        className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted rounded-md"
        onClick={handleProfileClick}
      >
        <Avatar className="h-9 w-9">
          {avatarUrl && (
            <AvatarImage 
              src={avatarUrl} 
              alt={`${displayName}'s avatar`}
              className="object-cover w-full h-full"
            />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {displayName}
              </span>
              <SubscriptionBadge tier={subscription.tier} className="h-5 px-1.5 py-0" />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {subscription.tier === "free" ? "Free Plan" : (
                subscription.tier === "premium" ? "Premium Plan" : "Pro Plan"
              )}
              <div className={subscription.tier === "free" ? "flex items-center" : "hidden"}>
                <CreditsBadge />
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keep Logout separate so it doesn't click with profile */}
      {!isCollapsed && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-1.5 h-7 px-2 flex items-center justify-start text-black hover:bg-gray-100" 
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Logout</span>
        </Button>
      )}
    </div>
  );
};
