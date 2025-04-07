
import { User, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  
  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'User';
  
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Avatar className="h-9 w-9">
          <AvatarImage 
            src={avatarUrl} 
            alt="User avatar" 
            className="object-cover"
          />
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
              {subscription.tier === "free" ? (
                <>
                  Free Plan
                  <CreditsBadge />
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </Button>
                </>
              ) : (
                <>
                  {subscription.tier === "premium" ? "Premium Plan" : "Pro Plan"}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Logout Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mt-2 justify-start text-black hover:text-gray-700 hover:bg-red-50 dark:hover:bg-red-950/20 w-full h-8"
        onClick={signOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {!isCollapsed && "Log out"}
      </Button>
    </div>
  );
};
