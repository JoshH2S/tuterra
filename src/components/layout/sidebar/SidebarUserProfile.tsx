
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CreditsBadge } from "@/components/credits/CreditsBadge";

interface SidebarUserProfileProps {
  isCollapsed?: boolean;
}

export const SidebarUserProfile = ({ isCollapsed = false }: SidebarUserProfileProps) => {
  const { user } = useAuth();
  
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
          <span className="font-medium">
            {user?.user_metadata?.first_name
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
              : user?.email || 'User'}
          </span>
          <span className="text-xs text-muted-foreground flex items-center">
            Free Plan
            <CreditsBadge />
          </span>
        </div>
      )}
    </div>
  );
};
