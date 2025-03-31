
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the AdvancedCharts component
const AdvancedCharts = lazy(() => import('@/components/desktop/AdvancedCharts'));

export function LazyAdvancedCharts() {
  return (
    <Suspense 
      fallback={
        <div className="hidden lg:block space-y-6">
          <Skeleton className="h-[350px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      }
    >
      <AdvancedCharts />
    </Suspense>
  );
}
