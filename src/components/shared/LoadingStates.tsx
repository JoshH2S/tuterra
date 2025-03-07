
import React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

/**
 * SimpleLoadingSkeleton component
 * - Minimal loading state for mobile
 * - Touch-friendly sizing and spacing
 */
export function SimpleLoadingSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

/**
 * DetailedLoadingSkeleton component
 * - Enhanced loading state for desktop
 * - More complex placeholder structure
 */
export function DetailedLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-10" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/6" />
        </div>
      </div>
      <div className="h-[150px] bg-gray-200 dark:bg-gray-700 rounded mt-4" />
    </div>
  );
}

/**
 * LoadingChart component
 * - Adaptive loading state for chart placeholders
 */
export function LoadingChart() {
  const { isDesktop } = useResponsive();
  
  return (
    <Card className={isDesktop ? "p-6" : "p-4"}>
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
        <div className={`bg-gray-200 dark:bg-gray-700 rounded ${isDesktop ? "h-[300px]" : "h-[200px]"}`} />
      </div>
    </Card>
  );
}

/**
 * LoadingCard component
 * - Adaptive loading state for content cards
 */
export function LoadingCard() {
  const { isDesktop } = useResponsive();
  
  return (
    <Card className={isDesktop ? "p-6" : "p-4"}>
      <div className="animate-pulse">
        {isDesktop ? <DetailedLoadingSkeleton /> : <SimpleLoadingSkeleton />}
      </div>
    </Card>
  );
}

/**
 * PullToRefreshLoader component
 * - Mobile-optimized loading indicator for pull-to-refresh actions
 */
export function PullToRefreshLoader() {
  return (
    <div className="flex justify-center items-center h-16 text-primary">
      <Loader className="h-6 w-6 animate-spin" />
      <span className="ml-2 text-sm font-medium">Refreshing...</span>
    </div>
  );
}

/**
 * AdaptiveLoading component
 * - Renders appropriate loading state based on device
 * - Optimized for different screen sizes
 */
export function AdaptiveLoading() {
  const { isDesktop } = useResponsive();
  
  return (
    <div
      className={cn(
        "w-full",
        // Simpler loading state for mobile
        "space-y-2",
        // More detailed loading state for desktop
        "lg:space-y-4"
      )}
    >
      {isDesktop ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingChart />
        </div>
      ) : (
        <div className="space-y-3">
          <LoadingCard />
          <LoadingCard />
        </div>
      )}
    </div>
  );
}

export default AdaptiveLoading;
