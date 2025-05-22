
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ButtonScrollableProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonScrollable({ children, className }: ButtonScrollableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Enable touch scroll with momentum on mobile
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    
    // Add momentum scroll for iOS
    scrollElement.classList.add("momentum-scroll");
    
    // Remove any lingering touch events
    return () => {
      scrollElement.classList.remove("momentum-scroll");
    };
  }, []);
  
  return (
    <div 
      className={cn(
        "flex items-center overflow-x-auto gap-2 pb-2 -mx-2 px-2 snap-x",
        "hide-scrollbar touch-manipulation",
        className
      )}
      ref={scrollRef}
    >
      {children}
    </div>
  );
}
