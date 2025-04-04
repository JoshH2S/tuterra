
import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glass" | "minimal" | "gradient";
  interactive?: boolean;
  hoverEffect?: "lift" | "scale" | "glow" | "none";
  className?: string;
  contentClassName?: string;
}

/**
 * PremiumCard component with modern premium styling
 * - Multiple variants and hover effects
 * - Mobile-friendly touch interactions
 * - Elegant shadow and gradient effects
 */
export function PremiumCard({
  children,
  variant = "default",
  interactive = false,
  hoverEffect = "none",
  className,
  contentClassName,
  ...props
}: PremiumCardProps) {
  const { isDesktop } = useResponsive();
  
  // Get variant-specific styles
  const getVariantStyles = () => {
    const baseStyles = "rounded-xl overflow-hidden transition-all duration-200";
    
    switch (variant) {
      case "elevated":
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-800",
          "shadow-[0_10px_20px_-5px_rgba(0,0,0,0.07),0_4px_8px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.8)]",
          "dark:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2),0_4px_8px_-2px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
          "border border-gray-100/80 dark:border-gray-700/80"
        );
      case "glass":
        return cn(
          baseStyles,
          "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
          "shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.7)]",
          "dark:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2),0_2px_6px_-1px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
          "border border-gray-100/50 dark:border-gray-700/50"
        );
      case "minimal":
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-800",
          "shadow-[0_2px_4px_-1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.8)]",
          "dark:shadow-[0_2px_4px_-1px_rgba(0,0,0,0.12),0_1px_2px_-1px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
          "border border-gray-100 dark:border-gray-700"
        );
      case "gradient":
        return cn(
          baseStyles,
          "bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
          "shadow-[0_8px_16px_-4px_rgba(0,0,0,0.06),0_3px_6px_-2px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.7)]",
          "dark:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2),0_3px_6px_-2px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
          "border border-gray-100 dark:border-gray-700"
        );
      default:
        return cn(
          baseStyles,
          "bg-white dark:bg-gray-800",
          "shadow-[0_6px_14px_-6px_rgba(0,0,0,0.05),0_4px_6px_-3px_rgba(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.6)]",
          "dark:shadow-[0_6px_14px_-6px_rgba(0,0,0,0.2),0_4px_6px_-3px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
          "border border-gray-100/80 dark:border-gray-700/80"
        );
    }
  };
  
  // Get hover effect styles
  const getHoverProps = (): MotionProps => {
    if (!interactive || !isDesktop) return {};
    
    switch (hoverEffect) {
      case "lift":
        return {
          whileHover: { y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.08), 0 6px 12px -4px rgba(0,0,0,0.04)" },
          transition: { duration: 0.2 }
        };
      case "scale":
        return {
          whileHover: { scale: 1.01 },
          transition: { duration: 0.2 }
        };
      case "glow":
        return {
          whileHover: { boxShadow: "0 8px 20px -6px rgba(59, 130, 246, 0.35), 0 4px 10px -3px rgba(59, 130, 246, 0.2)" },
          transition: { duration: 0.2 }
        };
      default:
        return {};
    }
  };

  // On mobile, provide a subtle tap feedback
  const getTapProps = (): MotionProps => {
    if (!interactive) return {};
    
    return {
      whileTap: { scale: 0.98 }
    };
  };

  return (
    <motion.div
      className={cn(getVariantStyles(), className)}
      {...getHoverProps()}
      {...getTapProps()}
      {...props}
    >
      <div 
        className={cn(
          "relative z-10",
          // Apply subtle top gradient highlight for metallic/glass effect
          "before:content-[''] before:absolute before:-top-1 before:left-0 before:right-0 before:h-3 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none",
          // For mobile, ensure touch areas are appropriate
          "touch-manipulation",
          contentClassName
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

/**
 * StatsCard component based on PremiumCard with stats-specific styling
 */
export function PremiumStatsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string | number;
  className?: string;
}) {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-green-500";
      case "down": return "text-red-500";
      case "neutral": return "text-gray-500";
      default: return "";
    }
  };

  return (
    <PremiumCard 
      variant="default" 
      className={cn("p-5", className)}
      contentClassName="h-full"
    >
      <div className="flex justify-between items-start h-full">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
          
          {trend && (
            <p className={cn("text-xs flex items-center gap-1 mt-2", getTrendColor())}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              {trendValue}
            </p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 rounded-full bg-gray-50 dark:bg-gray-700/50">
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

/**
 * PremiumContentCard component with header, body, and optional footer
 */
export function PremiumContentCard({
  title,
  description,
  children,
  footer,
  headerAction,
  className,
  bodyClassName,
  variant = "default",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  variant?: "default" | "elevated" | "glass" | "minimal" | "gradient";
}) {
  const { isDesktop } = useResponsive();
  
  return (
    <PremiumCard variant={variant} className={className}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
        
        <div className={cn("py-1", bodyClassName)}>
          {children}
        </div>
        
        {footer && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
