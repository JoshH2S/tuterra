
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipToContent - An accessibility component that allows keyboard users
 * to skip navigation and go directly to the main content.
 * - Hidden visually until focused
 * - Mobile-optimized styling
 * - High contrast for visibility
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50",
        "bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium",
        "rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
        "transition-transform origin-top-left",
        "text-gray-900 dark:text-gray-100 touch-manipulation"
      )}
    >
      Skip to content
    </a>
  );
}
