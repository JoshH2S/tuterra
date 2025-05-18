
// This file now just re-exports from the new structure
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FullPageLoader } from '@/components/ui/loading-states';
import { InternshipContextProvider, useInternshipContext } from './internship';

// Re-export for backward compatibility
export { useInternshipContext, InternshipContextProvider };
export * from './internship/types';
