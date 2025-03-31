
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentPerformance } from '@/types/student';

// Lazy load the PerformanceChart component
const PerformanceChart = lazy(() => import('@/components/dashboard/PerformanceChart').then(
  module => ({ default: module.PerformanceChart })
));

interface LazyPerformanceChartProps {
  performance: StudentPerformance[];
}

export function LazyPerformanceChart({ performance }: LazyPerformanceChartProps) {
  return (
    <Suspense 
      fallback={
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-8 w-56 mb-6" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      }
    >
      <PerformanceChart performance={performance} />
    </Suspense>
  );
}
