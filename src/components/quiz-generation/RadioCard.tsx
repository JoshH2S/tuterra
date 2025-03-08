
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
          "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
          "peer-checked:border-primary peer-checked:bg-primary/5",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
          "touch-action-manipulation",
          className
        )}
      >
        <Icon className="w-5 h-5 mt-0.5 text-primary" />
        <div className="flex-1">
          <p className="font-medium mb-1">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </motion.label>
    </div>
  );
};
