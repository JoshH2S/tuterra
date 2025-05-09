
import React, { ReactNode, useEffect, useState } from "react";
import { explanationCache } from "@/services/quiz/explanationCache";

interface ShowOneChildProps {
  children: ReactNode;
  activeIndex?: number;
}

/**
 * A component that only shows one of its children at a time based on activeIndex
 */
export const ShowOneChild = ({ children, activeIndex = 0 }: ShowOneChildProps) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safely access the children
  const childrenArray = React.Children.toArray(children);
  
  // Make sure we handle edge cases for the activeIndex
  const validIndex = Math.max(0, Math.min(activeIndex, childrenArray.length - 1));
  
  // Only render on the client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return <>{childrenArray[validIndex]}</>;
};

/**
 * Helper function to safely read from storage with proper error handling
 * This patches the original readRenderPromptFromStorage function
 */
export const readRenderPromptFromStorage = (key: string) => {
  try {
    // Check if explanationCache is defined before accessing methods
    if (!explanationCache || typeof explanationCache.get !== 'function') {
      console.warn('ExplanationCache is not properly initialized');
      return null;
    }
    
    // Create a proper ExplanationCacheKey object from the string key
    const cacheKey = { 
      questionId: key, 
      userAnswer: '' // Providing a default empty string as we don't have this info
    };
    
    // Now safely call the getWithTTL method if it exists
    if (typeof explanationCache.getWithTTL === 'function') {
      return explanationCache.getWithTTL(cacheKey);
    } else {
      // Fall back to regular get if getWithTTL doesn't exist
      return explanationCache.get(cacheKey);
    }
  } catch (error) {
    console.error('Error reading from cache storage:', error);
    return null;
  }
};
