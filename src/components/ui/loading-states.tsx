
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export function LoadingCard() {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`overflow-hidden ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className={`h-8 w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
        <div className="space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </Card>
  );
}

export function LoadingChart() {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`overflow-hidden ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="animate-pulse">
        <Skeleton className="h-4 w-1/4 mb-4 md:mb-8" />
        <Skeleton className={`h-[200px] md:h-[300px] w-full ${isMobile ? 'mt-2' : 'mt-4'}`} />
      </div>
    </Card>
  );
}

export function LoadingSpinner({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };
  
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <Loader className={`text-primary ${sizeClasses[size]}`} />
      </motion.div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <LoadingSpinner size="large" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </motion.div>
    </div>
  );
}

export function PullToRefreshIndicator({ visible }: { visible: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -20
      }}
      className="absolute top-0 left-0 right-0 flex justify-center"
    >
      <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
        <LoadingSpinner size="small" />
      </div>
    </motion.div>
  );
}
