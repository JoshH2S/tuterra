
// This file now just re-exports from the new structure
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FullPageLoader } from '@/components/ui/loading-states';
import { InternshipProvider, useInternship } from './internship';

// Re-export for backward compatibility
export { useInternship, InternshipProvider };
export * from './internship/types';
