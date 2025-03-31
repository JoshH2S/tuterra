
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the AdaptiveChart component
const AdaptiveChart = lazy(() => import('@/components/shared/AdaptiveChart'));

export const LazyAdaptiveChart = () => {
  return (
    <Suspense 
      fallback={
        <div className="w-full">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      }
    >
      <AdaptiveChart />
    </Suspense>
  );
};

// Named export for the inner components that can be lazy loaded individually
export const LazyAdaptiveSubjectChart = () => {
  const AdaptiveSubjectChart = lazy(() => 
    import('@/components/shared/AdaptiveChart').then(module => ({ 
      default: module.AdaptiveSubjectChart 
    }))
  );
  
  return (
    <Suspense 
      fallback={
        <div className="w-full">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      }
    >
      <AdaptiveSubjectChart />
    </Suspense>
  );
};
