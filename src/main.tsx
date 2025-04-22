
import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader2 } from 'lucide-react'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupGlobalErrorHandling } from './utils/errorHandler'

// ----- Hook Debug Import (only in dev) -----
if (import.meta.env.MODE === 'development') {
  // This will be tree-shaken away in production
  import('./utils/hookDebug.ts');
}
// -------------------------

// Initialize global error handling (captures uncaught errors/rejections)
setupGlobalErrorHandling();

// Lazy load the App component to avoid triggering API calls immediately
const App = lazy(() => import('./App.tsx'))

// Loading fallback component
const AppLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary componentName="App">
    <Suspense fallback={<AppLoading />}>
      <App />
    </Suspense>
  </ErrorBoundary>
);
