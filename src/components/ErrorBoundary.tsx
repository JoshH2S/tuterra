
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // This runs first if an error is thrown in a child
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // --- Production-safe logging: console, window, localStorage ---
    try {
      // Group logs (identifiable in console)
      console.group('🚨 Critical Error in:', this.props.componentName || 'Unknown Component');
      console.error('Error:', error);
      console.error('Error Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();

      // Store to window for Lovable error capture
      if (typeof window !== "undefined") {
        (window as any).__LOVABLE_ERROR__ = {
          ...((window as any).__LOVABLE_ERROR__ || {}),
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          componentName: this.props.componentName,
          timestamp: new Date().toISOString()
        };
      }

      // Persist to localStorage
      try {
        const errorLog = {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          componentName: this.props.componentName,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('lastError', JSON.stringify(errorLog));
      } catch (storageErr) {
        console.warn('Failed to log error to localStorage:', storageErr);
      }
    } catch (loggingError) {
      console.error('Failed to log error properly:', loggingError);
      console.error('Original error:', error);
    }
    this.setState({ hasError: true, error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-red-600">Error details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

// Shortcut for functional usage
export const CourseErrorBoundary = (props: ErrorBoundaryProps) => <ErrorBoundary {...props} />;
