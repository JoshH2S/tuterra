
import React, { Component, ErrorInfo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
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
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    // Example: Send error to error-tracking service here if wanted.
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

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
              There was an error loading this content. Please try again or contact support if the problem persists.
            </p>
            <pre className="bg-muted/50 rounded p-2 mb-2 text-xs text-red-700 overflow-x-auto">
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack 
                ? `\n${this.state.errorInfo.componentStack}` 
                : ""}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
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

// For shortcut usage as a function component
export const CourseErrorBoundary = (props: ErrorBoundaryProps) => {
  return <ErrorBoundary {...props} />;
};
