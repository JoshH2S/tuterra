
import { Badge } from "@/components/ui/badge";
import { Crown, CircleCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  tier: "free" | "pro" | "premium";
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

export const SubscriptionBadge = ({ 
  tier, 
  className, 
  showIcon = true, 
  showLabel = true 
}: SubscriptionBadgeProps) => {
  const variants = {
    free: {
      icon: Shield,
      label: "Free",
      className: "bg-gray-100 text-gray-800 border-gray-200"
    },
    pro: {
      icon: CircleCheck,
      label: "Pro",
      className: "bg-primary/10 text-primary border-primary/20"
    },
    premium: {
      icon: Crown,
      label: "Premium",
      className: "bg-amber-500/10 text-amber-500 border-amber-200"
    }
  };

  const { icon: Icon, label, className: badgeClassName } = variants[tier];

  return (
    <Badge 
      variant="outline"
      className={cn(
        "h-7 px-2 py-1 gap-1 font-medium text-xs",
        badgeClassName,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {showLabel && label}
    </Badge>
  );
};
