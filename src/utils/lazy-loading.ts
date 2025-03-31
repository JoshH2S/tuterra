
import { lazy, ComponentType } from 'react';

/**
 * Utility function to lazy load components with better error handling and naming
 * @param importFunc - Dynamic import function
 * @param componentName - Name of the component for better debugging
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      console.error(`Error loading ${componentName}:`, error);
      throw error;
    }
  });
  
  // Add a displayName for better debugging
  LazyComponent.displayName = `LazyLoaded(${componentName})`;
  
  return LazyComponent;
}
