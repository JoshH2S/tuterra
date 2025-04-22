
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
  
  // Removed setting displayName as it's not supported on LazyExoticComponent
  
  return LazyComponent;
}

/**
 * Utility function to lazy load named exports
 * @param importFunc - Dynamic import function
 * @param exportName - Name of the exported item
 * @param componentName - Name of the component for better debugging
 * @returns Lazy loaded component
 */
export function lazyLoadNamed<T extends ComponentType<any>>(
  importFunc: () => Promise<Record<string, T>>,
  exportName: string,
  componentName: string
): React.LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFunc();
      return { default: module[exportName] };
    } catch (error) {
      console.error(`Error loading ${componentName}:`, error);
      throw error;
    }
  });
  
  return LazyComponent;
}
