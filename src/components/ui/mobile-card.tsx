
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
        "touch-manipulation no-context-menu",
        isActive && "ring-2 ring-primary",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MobileCardHeader({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4", className)}
      {...props}
    />
  );
}

export function MobileCardTitle({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function MobileCardDescription({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function MobileCardContent({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4 pt-0", className)} {...props} />
  );
}

export function MobileCardFooter({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-4 pt-0", className)}
      {...props}
    />
  );
}
