
// Extend the global Window interface to include our custom diagnostics property
interface Window {
  __tuterra_diagnostics?: {
    loadTimestamp: number;
    pageLoadEvents: Array<{
      timestamp: number;
      timeSinceLoad: number;
      event: string;
    }>;
    recordEvent: (event: string) => void;
  };
}
