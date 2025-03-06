
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
}

export class InterviewErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Interview error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Something went wrong</h3>
          <p className="text-muted-foreground mt-2 mb-4 max-w-md">
            There was an error in the interview process. This could be due to 
            connection issues or a problem with the question generation.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
