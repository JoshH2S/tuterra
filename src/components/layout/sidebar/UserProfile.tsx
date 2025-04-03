
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { CreditsBadge } from "@/components/credits/CreditsBadge";
import { SubscriptionBadge } from "@/components/ai-tutor/SubscriptionBadge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface UserProfileProps {
  isCollapsed?: boolean;
}

export function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();

  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
    : user?.email || "User";

  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="mt-auto">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex h-14 w-full items-center justify-between gap-2 p-2",
                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-col overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{displayName}</span>
                          <SubscriptionBadge tier={subscription.tier} className="h-5 px-1.5 py-0" />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {subscription.tier === "free" ? (
                            <>
                              Free Plan
                              <CreditsBadge />
                            </>
                          ) : (
                            subscription.tier === "premium" ? "Premium Plan" : "Pro Plan"
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.tier === "free"
                      ? "Free Plan"
                      : subscription.tier === "premium"
                      ? "Premium Plan"
                      : "Pro Plan"}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile-settings" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/update-password" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Update Password</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-500">
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
