
import { useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isCollapsed?: boolean;
  isActive?: boolean;
  children?: ReactNode;
  className?: string;
}

export function NavItem({
  icon: Icon,
  label,
  path,
  isCollapsed = false,
  isActive = false,
  children,
  className,
}: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = !!children;

  const item = (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-md p-2",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "transition-colors duration-200 ease-in-out",
        isActive && "bg-slate-100 dark:bg-slate-800 font-medium",
        hasChildren && isOpen && "bg-slate-100 dark:bg-slate-800",
        className
      )}
      onClick={() => hasChildren && setIsOpen(!isOpen)}
    >
      <Icon
        className={cn(
          "h-5 w-5 text-slate-500 dark:text-slate-400",
          isActive && "text-slate-900 dark:text-slate-100"
        )}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {hasChildren && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div>
      {isCollapsed ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  className="flex h-9 w-9 p-0 data-[state=open]:bg-slate-100 data-[state=open]:dark:bg-slate-800"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {item}
                </Button>
              ) : (
                <Link to={path}>{item}</Link>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : hasChildren ? (
        <div className="cursor-pointer">{item}</div>
      ) : (
        <Link to={path}>{item}</Link>
      )}

      {hasChildren && isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 mt-1 space-y-1 pl-2 border-l border-slate-200 dark:border-slate-700"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
