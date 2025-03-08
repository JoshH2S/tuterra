
import React from "react";
import { motion } from "framer-motion";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioCardProps {
  value: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  className?: string;
}

export const RadioCard = ({ 
  value, 
  icon: Icon, 
  label, 
  description, 
  className 
}: RadioCardProps) => {
  return (
    <div className="relative">
      <RadioGroupItem
        value={value}
        id={`radio-${value}`}
        className="sr-only peer"
      />
      <motion.label
        htmlFor={`radio-${value}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 relative",
          "peer-checked:border-primary peer-checked:bg-white dark:peer-checked:bg-gray-800 peer-checked:shadow-md",
          "peer-checked:ring-2 peer-checked:ring-primary peer-checked:z-10",
          "hover:bg-white dark:hover:bg-gray-800",
          "bg-gray-50 dark:bg-gray-900/50",
          "touch-action-manipulation",
          className
        )}
      >
        <Icon className="w-5 h-5 mt-0.5 text-muted-foreground peer-checked:text-primary transition-colors duration-200" />
        <div className="flex-1">
          <p className="font-medium mb-1 transition-colors duration-200 peer-checked:text-primary">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="absolute right-3 top-3 opacity-0 peer-checked:opacity-100 text-primary">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
        </div>
      </motion.label>
    </div>
  );
};
