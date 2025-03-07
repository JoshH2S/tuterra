
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * InteractiveTooltip - A mobile-friendly enhanced tooltip component
 * - Touch-optimized with larger touch targets for mobile
 * - Responsive positioning based on screen size
 * - Accessible focus handling
 */
export function InteractiveTooltip({ 
  trigger, 
  content,
  className,
  touchFriendly = true,
  ...props
}: { 
  trigger: React.ReactNode; 
  content: React.ReactNode;
  className?: string;
  touchFriendly?: boolean;
}) {
  // Detect if we're on a touch device - simplified approach
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  
  React.useEffect(() => {
    const isTouchCapable = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0;
    setIsTouchDevice(isTouchCapable);
  }, []);

  return (
    <TooltipPrimitive.Provider delayDuration={isTouchDevice ? 300 : 200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className={cn(
            "inline-flex",
            touchFriendly && isTouchDevice ? "min-h-[44px] min-w-[44px] items-center justify-center touch-manipulation" : "",
          )}>
            {trigger}
          </span>
        </TooltipPrimitive.Trigger>
        
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={isTouchDevice ? 10 : 5}
            side={isTouchDevice ? "bottom" : undefined}
            className={cn(
              "z-50 overflow-hidden rounded-md",
              "border bg-white px-3 py-1.5",
              "text-sm text-gray-950 shadow-md animate-in fade-in-0",
              "zoom-in-95 data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2",
              "data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2",
              "data-[side=top]:slide-in-from-bottom-2",
              "dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
              // Additional mobile-friendly classes
              isTouchDevice && "px-4 py-2 text-base max-w-[90vw]",
              className
            )}
            {...props}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-current text-white dark:text-gray-950" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
