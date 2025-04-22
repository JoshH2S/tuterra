
/**
 * Global error handling for production and development.
 * Catches uncaught errors and unhandled promise rejections.
 */
export function setupGlobalErrorHandling() {
  // Safely attach only once per session
  if ((window as any).__LOVABLE_GLOBAL_ERROR_HANDLER_SET__) return;
  (window as any).__LOVABLE_GLOBAL_ERROR_HANDLER_SET__ = true;

  // Uncaught JS errors
  window.addEventListener('error', (event) => {
    try {
      console.group('🌍 Global Error');
      console.error('Error:', event.error);
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      console.groupEnd();

      // Store for Lovable error capture
      if (typeof window !== 'undefined') {
        (window as any).__LOVABLE_ERROR__ = {
          ...((window as any).__LOVABLE_ERROR__ || {}),
          globalError: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (err) {
      console.error('Failed to handle global error:', err);
    }
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    try {
      console.group('🌍 Unhandled Promise Rejection');
      console.error('Reason:', event.reason);
      console.groupEnd();

      if (typeof window !== 'undefined') {
        (window as any).__LOVABLE_ERROR__ = {
          ...((window as any).__LOVABLE_ERROR__ || {}),
          unhandledRejection: {
            reason: event.reason?.toString(),
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (err) {
      console.error('Failed to handle unhandled rejection:', err);
    }
  });
}
