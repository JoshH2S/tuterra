
import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useResponsive } from "@/hooks/useResponsive";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
  interactive?: boolean;
  variant?: "default" | "outline" | "ghost" | "elevated";
}

/**
 * ResponsiveCard component
 * - Adapts styling for mobile and desktop
 * - Optional animations and interactions
 * - Responsive padding and shadows
 */
export function ResponsiveCard({
  children,
  className,
  animate = false,
  interactive = false,
  variant = "default",
  ...props
}: ResponsiveCardProps) {
  const { isDesktop } = useResponsive();

  // Apply different styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return "border-2 border-gray-200 dark:border-gray-700 bg-transparent";
      case "ghost":
        return "bg-gray-50/50 dark:bg-gray-800/30 border-0";
      case "elevated":
        return "border bg-white dark:bg-gray-800 shadow-lg";
      case "default":
      default:
        return "border bg-white dark:bg-gray-800";
    }
  };

  // Base component with responsive styling
  const baseComponent = (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        // Base styles
        getVariantStyles(),
        // Mobile styles
        "p-4",
        // Desktop styles
        "lg:p-6",
        // Interactive hover states only on desktop
        interactive && isDesktop && "cursor-pointer lg:hover:shadow-lg lg:transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  // If animation is enabled, wrap in motion.div
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        whileHover={interactive && isDesktop ? { y: -5 } : undefined}
      >
        {baseComponent}
      </motion.div>
    );
  }

  return baseComponent;
}

/**
 * Feature Card component built on top of ResponsiveCard
 * - Adapts for desktop and mobile
 * - Responsive layout and spacing
 */
export function FeatureCard({
  icon,
  title,
  description,
  ...props
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  [key: string]: any;
}) {
  return (
    <ResponsiveCard animate interactive {...props}>
      <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-fit">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </ResponsiveCard>
  );
}
