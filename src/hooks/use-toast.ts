
import { toast as toastPrimitive } from "@/components/ui/use-toast";

// Helper to get types from component props
type ToastProps = Parameters<typeof toastPrimitive>[0];

// Export the toast function
export const toast = toastPrimitive;

// Export the hook (if needed)
export const useToast = () => {
  return { toast };
};
