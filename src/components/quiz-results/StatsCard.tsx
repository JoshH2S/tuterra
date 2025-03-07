
import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, icon, className }: StatsCardProps) {
  return (
    <Card className={cn(
      "p-6 flex flex-col gap-3 border-none shadow-sm", 
      className
    )}>
      <div className="flex items-center gap-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </Card>
  );
}
