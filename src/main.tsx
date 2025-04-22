
import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader2 } from 'lucide-react'
import './index.css'

// Record diagnostic event
if (window.__tuterra_diagnostics) {
  window.__tuterra_diagnostics.recordEvent('main.tsx execution started');
}

// Module load order diagnostics
console.log('[TUTERRA DIAGNOSTICS] Module Load Order:', {
  timestamp: Date.now(),
  moduleId: import.meta.url,
  hasReact: typeof React !== 'undefined',
  hasDOM: typeof document !== 'undefined',
  environment: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
});

// Lazy load the App component to avoid triggering API calls immediately
const App = lazy(() => {
  if (window.__tuterra_diagnostics) {
    window.__tuterra_diagnostics.recordEvent('App module import started');
  }
  
  return import('./App.tsx').then(module => {
    if (window.__tuterra_diagnostics) {
      window.__tuterra_diagnostics.recordEvent('App module import completed');
    }
    return module;
  });
});

// Loading fallback component
const AppLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

// Error boundary to catch any errors during component loading
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[TUTERRA DIAGNOSTICS] App loading error:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    if (window.__tuterra_diagnostics) {
      window.__tuterra_diagnostics.recordEvent(`Error boundary caught: ${error.message}`);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">The application failed to load. Please try refreshing the page.</p>
        <pre className="text-xs text-left bg-gray-100 p-2 mb-4 max-w-full overflow-x-auto">
          {this.state.error?.toString()}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>;
    }

    return this.props.children;
  }
}

// Record mount attempt
if (window.__tuterra_diagnostics) {
  window.__tuterra_diagnostics.recordEvent('Attempting to mount React app');
}

// Try to detect localStorage issues one more time before mount
try {
  const storageTest = {
    available: typeof localStorage !== 'undefined',
    writable: (() => {
      try {
        localStorage.setItem('tuterra_mount_test', 'test');
        localStorage.removeItem('tuterra_mount_test');
        return true;
      } catch (e) {
        console.error('[TUTERRA DIAGNOSTICS] Pre-mount localStorage test failed:', e);
        return false;
      }
    })()
  };
  console.log('[TUTERRA DIAGNOSTICS] Pre-mount storage check:', storageTest);
} catch (e) {
  console.error('[TUTERRA DIAGNOSTICS] Error during pre-mount storage check:', e);
}

try {
  console.log('[TUTERRA DIAGNOSTICS] Root element exists:', !!document.getElementById("root"));
  
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );
  
  if (window.__tuterra_diagnostics) {
    window.__tuterra_diagnostics.recordEvent('React app rendered');
  }
} catch (e) {
  console.error('[TUTERRA DIAGNOSTICS] Failed to mount React app:', e);
  
  if (window.__tuterra_diagnostics) {
    window.__tuterra_diagnostics.recordEvent(`Mount error: ${e.message}`);
  }
}

// Log all diagnostic events after mount attempt
setTimeout(() => {
  if (window.__tuterra_diagnostics) {
    console.log('[TUTERRA DIAGNOSTICS] Complete event timeline:', 
      window.__tuterra_diagnostics.pageLoadEvents);
  }
}, 1000);
