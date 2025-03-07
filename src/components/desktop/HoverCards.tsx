
import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";

interface DesktopCardProps extends Omit<HTMLMotionProps<"div">, "className"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "outline";
  hoverEffect?: "lift" | "scale" | "glow" | "border" | "none";
}

/**
 * DesktopCard component with enhanced hover effects for desktop
 * - Conditionally applies hover animations based on device
 * - Falls back to mobile-friendly styling on smaller screens
 * - Multiple hover effect options
 */
export function DesktopCard({
  children,
  className,
  variant = "default",
  hoverEffect = "lift",
  ...props
}: DesktopCardProps) {
  const { isDesktop } = useResponsive();

  // Determine hover animation based on effect type and device
  const getHoverAnimation = () => {
    if (!isDesktop) return undefined;

    switch (hoverEffect) {
      case "lift":
        return { y: -8, transition: { duration: 0.2 } };
      case "scale":
        return { scale: 1.03, transition: { duration: 0.2 } };
      case "glow":
        return { boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)", transition: { duration: 0.2 } };
      case "border":
        return { borderColor: "rgba(59, 130, 246, 0.8)", transition: { duration: 0.2 } };
      case "none":
      default:
        return undefined;
    }
  };

  // Determine card styles based on variant
  const getCardStyles = () => {
    const baseStyles = "rounded-xl transition-all duration-200";
    
    switch (variant) {
      case "subtle":
        return cn(baseStyles, "bg-gray-50 dark:bg-gray-800/50");
      case "outline":
        return cn(baseStyles, "border-2 border-gray-200 dark:border-gray-700 bg-transparent");
      case "default":
      default:
        return cn(baseStyles, "bg-white dark:bg-gray-800 shadow-md");
    }
  };

  return (
    <motion.div
      className={cn(
        getCardStyles(),
        hoverEffect === "glow" && "hover:shadow-blue-300/50",
        hoverEffect === "border" && "border-2 border-transparent",
        className
      )}
      whileHover={getHoverAnimation()}
      {...props}
    >
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * Desktop Feature Card with hover effects
 * - Enhanced interaction for desktop users
 * - Clean visualization of feature information
 */
export function DesktopFeatureCard({
  icon,
  title,
  description,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <DesktopCard hoverEffect="lift" className={className} {...props}>
      <div className="flex flex-col items-start gap-4">
        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </DesktopCard>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: number;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Desktop Stats Card with hover enhancement
 * - Shows key statistics with enhanced hover on desktop
 * - Gracefully degrades on mobile
 */
export function DesktopStatsCard({
  label,
  value,
  delta,
  icon,
  className,
  ...props
}: StatsCardProps) {
  const deltaColor = delta && delta > 0 ? "text-green-600" : "text-red-600";

  return (
    <DesktopCard hoverEffect="scale" variant="subtle" className={className} {...props}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {delta && (
            <p className={cn("text-sm font-medium flex items-center gap-1", deltaColor)}>
              {delta > 0 ? "+" : ""}
              {delta}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
            {icon}
          </div>
        )}
      </div>
    </DesktopCard>
  );
}
