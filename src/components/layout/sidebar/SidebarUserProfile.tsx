import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const { user, authReady, signOut } = useAuth();
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
  }, [user]);

  if (!authReady) {
    return <div className="h-16 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
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
    <div className="flex flex-col w-full gap-0.5">
      <div
        className="flex items-center gap-2.5 px-2 py-2 cursor-pointer rounded-lg hover:bg-white/6 transition-colors"
        onClick={handleProfileClick}
      >
        <Avatar className="h-8 w-8 ring-1 ring-white/10 shrink-0">
          {avatarUrl && (
            <AvatarImage
              src={avatarUrl}
              alt={`${displayName}'s avatar`}
              className="object-cover w-full h-full"
            />
          )}
          <AvatarFallback className="bg-[#1a2d50] text-white/70 text-xs">{initials}</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-medium text-white/90 truncate leading-tight">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <SubscriptionBadge tier={subscription.tier} className="h-4 px-1.5 py-0 text-[10px]" />
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 flex items-center justify-start text-white/35 hover:text-white/60 hover:bg-white/5"
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Logout</span>
        </Button>
      )}
    </div>
  );
};
