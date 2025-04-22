
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // Add this import

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

// Try to detect localStorage issues before mount
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
    <React.StrictMode>
      <App />
    </React.StrictMode>
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
