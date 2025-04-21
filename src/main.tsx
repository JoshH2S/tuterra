
import { createRoot } from 'react-dom/client'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import './index.css'

// Lazy load the App component to avoid triggering API calls immediately
const App = lazy(() => import('./App.tsx'))

// Loading fallback component
const AppLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

// Error boundary to catch any errors during component loading
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="mb-4">The application failed to load. Please try refreshing the page.</p>
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

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Suspense fallback={<AppLoading />}>
      <App />
    </Suspense>
  </ErrorBoundary>
);
