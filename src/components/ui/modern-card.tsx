
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipeable } from "react-swipeable";

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'outline' | 'glass';
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function ModernCard({ 
  gradient, 
  interactive, 
  variant = 'default',
  className,
  children,
  onSwipeLeft,
  onSwipeRight,
  ...props 
}: ModernCardProps) {
  const isMobile = useIsMobile();
  
  // Configure swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    trackMouse: false,
    preventDefaultTouchmoveEvent: false
  });
  
  // Apply appropriate animations based on device type
  const hoverAnimation = !isMobile && interactive 
    ? { y: -2, scale: 1.01 } 
    : undefined;
  
  // For touch devices, use a different animation to provide feedback
  const tapAnimation = isMobile && interactive 
    ? { scale: 0.98 } 
    : { scale: 0.95 };

  return (
    <motion.div
      {...(isMobile && (onSwipeLeft || onSwipeRight) ? swipeHandlers : {})}
      whileHover={hoverAnimation}
      whileTap={interactive ? tapAnimation : undefined}
      className={cn(
        "rounded-xl overflow-hidden",
        "transition-all duration-200",
        {
          'bg-white dark:bg-gray-800 shadow-card': variant === 'default',
          'border border-gray-200 dark:border-gray-700': variant === 'outline',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm': variant === 'glass',
          'bg-gradient-to-br from-brand-light via-brand to-brand-dark': gradient,
          'touch-manipulation': isMobile && interactive, // Improve touch target
        },
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Additional card components for common use cases

export function ContentCard({ 
  title, 
  subtitle,
  children,
  footer,
  ...props 
}: { 
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
} & Omit<ModernCardProps, 'children'>) {
  const isMobile = useIsMobile();
  
  return (
    <ModernCard {...props}>
      <div className={cn(
        "flex flex-col",
        isMobile ? "p-4 gap-3" : "p-6 gap-4"
      )}>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={isMobile ? "my-1" : "my-2"}>
          {children}
        </div>
        
        {footer && (
          <div className={cn(
            "mt-auto", 
            isMobile ? "pt-2" : "pt-4"
          )}>
            {footer}
          </div>
        )}
      </div>
    </ModernCard>
  );
}

export function TouchableCard({
  onPress,
  children,
  ...props
}: {
  onPress: () => void;
  children: React.ReactNode;
} & Omit<ModernCardProps, 'children' | 'interactive'>) {
  return (
    <ModernCard
      interactive
      onClick={onPress}
      className="touch-manipulation" // Improve touch target
      {...props}
    >
      {children}
    </ModernCard>
  );
}
