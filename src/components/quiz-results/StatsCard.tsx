
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  className?: string;
  touchFeedback?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  className,
  touchFeedback = false
}: StatsCardProps) {
  const CardComponent = touchFeedback ? motion.div : "div";
  
  return (
    <CardComponent
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 p-6",
        "flex flex-col items-center text-center",
        "transition-all duration-200",
        touchFeedback && "active:scale-95 cursor-pointer",
        className
      )}
      whileTap={touchFeedback ? { scale: 0.97 } : undefined}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </CardComponent>
  );
}
