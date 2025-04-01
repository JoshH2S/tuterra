
import { User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { Button } from "@/components/ui/button";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User avatar"
            className="aspect-square h-full w-full rounded-md object-cover"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      {!isCollapsed && (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {user?.user_metadata?.first_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
                : user?.email || 'User'}
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
  );
};
