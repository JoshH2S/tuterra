
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileCardProps extends Omit<HTMLMotionProps<"div">, "onPress"> {
  onPress?: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}

export function MobileCard({ 
  children, 
  onPress, 
  isActive, 
  className, 
  ...props 
}: MobileCardProps) {
  return (
    <motion.div
      whileTap={{ scale: onPress ? 0.98 : 1 }}
      onClick={onPress}
      className={cn(
        "relative overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm",
        "active:bg-accent/5",
        "touch-manipulation",
        isActive && "ring-2 ring-primary",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const MobileCardHeader = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-4 pb-2", className)}
    {...props}
  />
);

export const MobileCardTitle = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);

export const MobileCardDescription = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

export const MobileCardContent = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 pt-0", className)} {...props} />
);

export const MobileCardFooter = ({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
);
